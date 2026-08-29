from dotenv import load_dotenv
load_dotenv()

import os
import io
import re
import json
import math
import asyncio
import logging
import ipaddress
from contextlib import asynccontextmanager
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse
from datetime import datetime, timezone, timedelta
from typing import Optional

import bcrypt
import httpx
import jwt
import numpy as np
import pandas as pd
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, UploadFile, File
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr

# --- LOGGING SETUP ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# --- SECURE CONFIGURATION & CONSTANTS ---
JWT_ALGORITHM = "HS256"
MAX_ROWS = 20000

mongo_url = os.environ.get("MONGO_URL")
if not mongo_url:
    raise RuntimeError("CRITICAL: MONGO_URL environment variable is not set.")

db_name = os.environ.get("DB_NAME", "masterkey")
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]


def get_jwt_secret() -> str:
    secret = os.environ.get("JWT_SECRET")
    if not secret:
        raise RuntimeError("CRITICAL: JWT_SECRET environment variable is not set.")
    return secret


# --- LIFESPAN MANAGEMENT (Replaces Deprecated Startup/Shutdown Events) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    await db.users.create_index("email", unique=True)
    await db.dataset_rows.create_index("dataset_id")
    await db.login_attempts.create_index("identifier")

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@masterkeyanalysis.in").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD")

    if admin_password:
        existing = await db.users.find_one({"email": admin_email})
        hashed = bcrypt.hashpw(admin_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        if existing is None:
            await db.users.insert_one(
                {
                    "email": admin_email,
                    "password_hash": hashed,
                    "name": "Vasanth",
                    "role": "admin",
                    "created_at": datetime.now(timezone.utc),
                }
            )
            logger.info(f"Seeded admin user {admin_email}")
        elif not bcrypt.checkpw(admin_password.encode("utf-8"), existing["password_hash"].encode("utf-8")):
            await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hashed}})
    else:
        logger.warning("ADMIN_PASSWORD not configured in environment. Skipping auto-seed.")

    yield

    # Shutdown tasks
    client.close()


app = FastAPI(lifespan=lifespan)
api_router = APIRouter()

# --- SECURITY & AUTH UTILITIES ---

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


async def get_current_admin(request: Request):
    auth = request.headers.get("Authorization", "")
    token = auth[7:] if auth.startswith("Bearer ") else request.cookies.get("access_token")

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user.get("name", "Admin"),
        "role": user.get("role", "admin"),
    }


def to_oid(id_str: str) -> ObjectId:
    if not ObjectId.is_valid(id_str):
        raise HTTPException(status_code=404, detail="Record not found")
    return ObjectId(id_str)


# --- EMAIL INTEGRATION ---

EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "Master Key Analysis")
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")
OWNER_NOTIFY_EMAIL = os.environ.get("OWNER_NOTIFY_EMAIL")

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = (
    "reply with your password", "reply with the code", "send your password", "cvv",
    "send us your password", "enter your password below", "confirm your card number",
    "your full card number", "seed phrase", "recovery phrase", "verify your card",
    "social security number", "confirm your bank details"
)
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links must be absolute https: {url!r} (G3)")
        parsed = urlparse(low)
        host = parsed.hostname or ""
        if not _host_ok(host) or parsed.username is not None:
            raise ValueError(f"Invalid host or credential URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text host mismatch: {m.group(1)!r} != {real!r} (G3)")


async def send_email(*, to: str, subject: str, html: str, reply_to: Optional[str] = None) -> Optional[str]:
    _assert_safe_email(subject, html)
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if reply_to or EMAIL_REPLY_TO:
        payload["contact_email"] = reply_to or EMAIL_REPLY_TO
    try:
        async with httpx.AsyncClient(timeout=30) as http_client:
            resp = await http_client.post(
                f"{EMAIL_BASE_URL}/api/v1/email/send",
                headers={"X-Email-Key": EMAIL_KEY},
                json=payload,
            )
        resp.raise_for_status()
        return resp.json().get("id")
    except Exception as e:
        logger.error(f"Email send error: {e}")
        return None


def enquiry_email_html(doc) -> str:
    rows = "".join(
        f'<tr><td style="padding:10px 16px;color:#64748B;font-size:13px;width:110px;vertical-align:top">{label}</td>'
        f'<td style="padding:10px 16px;color:#0A1428;font-size:14px;font-weight:600">{escape(str(value)) if value else "—"}</td></tr>'
        for label, value in [
            ("Name", doc["name"]),
            ("Email", doc["email"]),
            ("Phone", doc.get("phone")),
            ("Service", doc.get("service")),
        ]
    )
    return (
        '<table role="presentation" width="100%" style="background:#F1F5F9;padding:32px 0">'
        '<tr><td align="center">'
        '<table role="presentation" width="560" style="background:#ffffff;border-radius:12px;overflow:hidden;font-family:Arial,sans-serif">'
        '<tr><td style="background:#0A1428;padding:20px 28px">'
        '<span style="color:#F97316;font-size:18px;font-weight:bold">Master Key Analysis</span>'
        '<span style="color:#94A3B8;font-size:12px;float:right;padding-top:4px">New website enquiry</span>'
        '</td></tr>'
        f'<tr><td style="padding:8px 12px"><table role="presentation" width="100%">{rows}</table></td></tr>'
        '<tr><td style="padding:8px 28px 24px">'
        '<p style="color:#64748B;font-size:13px;margin:8px 0 4px">Message</p>'
        f'<p style="color:#0A1428;font-size:14px;line-height:1.6;background:#F8FAFC;border-left:3px solid #F97316;padding:12px 16px;margin:0">{escape(doc["message"])}</p>'
        '</td></tr>'
        '</table></td></tr></table>'
    )


def client_auto_reply_html(doc) -> str:
    first_name = escape(doc["name"].split(" ")[0])
    service_line = (
        f'<p style="color:#475569;font-size:14px;line-height:1.6">You asked about '
        f'<strong style="color:#0A1428">{escape(doc["service"])}</strong> — that is right in our wheelhouse.</p>'
        if doc.get("service") else ""
    )
    return (
        '<table role="presentation" width="100%" style="background:#F1F5F9;padding:32px 0">'
        '<tr><td align="center">'
        '<table role="presentation" width="560" style="background:#ffffff;border-radius:12px;overflow:hidden;font-family:Arial,sans-serif">'
        '<tr><td style="background:#0A1428;padding:24px 28px">'
        '<span style="color:#F97316;font-size:18px;font-weight:bold">Master Key Analysis</span>'
        '</td></tr>'
        '<tr><td style="padding:28px">'
        f'<p style="color:#0A1428;font-size:20px;font-weight:bold;margin:0 0 12px">Thank you, {first_name}.</p>'
        '<p style="color:#475569;font-size:14px;line-height:1.6">We received your enquiry and will get back to you shortly.</p>'
        f'{service_line}'
        '</td></tr>'
        '</table></td></tr></table>'
    )


async def notify_new_enquiry(doc):
    try:
        subject = f"New enquiry: {doc['name']} — {doc.get('service') or 'General'}"
        await send_email(to=OWNER_NOTIFY_EMAIL, subject=subject, html=enquiry_email_html(doc))
    except Exception as e:
        logger.error(f"Enquiry notification error: {e}")
    try:
        first_name = doc["name"].split(" ")[0]
        await send_email(
            to=doc["email"],
            subject=f"Thank you, {first_name} — we received your enquiry",
            html=client_auto_reply_html(doc),
        )
    except Exception as e:
        logger.error(f"Client auto-reply error: {e}")


# --- PYDANTIC SCHEMAS ---

class LoginInput(BaseModel):
    email: EmailStr
    password: str


class EnquiryInput(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    service: Optional[str] = None
    message: str


def iso(dt):
    return dt.isoformat() if isinstance(dt, datetime) else dt


def serialize_enquiry(doc):
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "email": doc["email"],
        "phone": doc.get("phone"),
        "service": doc.get("service"),
        "message": doc["message"],
        "status": doc.get("status", "new"),
        "created_at": iso(doc.get("created_at")),
    }


def serialize_dataset(doc):
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "filename": doc["filename"],
        "row_count": doc["row_count"],
        "column_count": doc["column_count"],
        "columns": doc.get("columns", []),
        "truncated": doc.get("truncated", False),
        "uploaded_by": doc.get("uploaded_by"),
        "created_at": iso(doc.get("created_at")),
    }


# --- ROUTES ---

@api_router.get("/")
async def root():
    return {"message": "Master Key Analysis API"}


# ---------------- Auth ----------------

@api_router.post("/auth/login")
async def login(input: LoginInput, request: Request):
    email = input.email.lower().strip()
    # Secure rate limit identifier avoiding proxy host spoofing
    identifier = f"login_lock:{email}"

    attempts = await db.login_attempts.find_one({"identifier": identifier})
    if attempts and attempts.get("count", 0) >= 5:
        locked_until = attempts.get("locked_until")
        if isinstance(locked_until, datetime) and locked_until.tzinfo is None:
            locked_until = locked_until.replace(tzinfo=timezone.utc)
        if locked_until and locked_until > datetime.now(timezone.utc):
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(input.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {
                "$inc": {"count": 1},
                "$set": {"locked_until": datetime.now(timezone.utc) + timedelta(minutes=15)},
            },
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")

    await db.login_attempts.delete_one({"identifier": identifier})
    token = create_access_token(str(user["_id"]), email, user.get("role", "admin"))
    return {
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "email": email,
            "name": user.get("name", "Admin"),
            "role": user.get("role", "admin"),
        },
    }


@api_router.get("/auth/me")
async def auth_me(admin=Depends(get_current_admin)):
    return admin


# ---------------- Enquiries ----------------

@api_router.post("/enquiries", status_code=201)
@api_router.post("/enquiry", status_code=201)
async def create_enquiry(input: EnquiryInput):
    doc = {
        "name": input.name.strip(),
        "email": input.email.lower(),
        "phone": input.phone,
        "service": input.service,
        "message": input.message.strip(),
        "status": "new",
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.enquiries.insert_one(doc)
    if EMAIL_KEY and OWNER_NOTIFY_EMAIL:
        asyncio.create_task(notify_new_enquiry(doc))
    return {"id": str(result.inserted_id), "message": "Enquiry received"}


@api_router.get("/enquiries")
async def list_enquiries(admin=Depends(get_current_admin)):
    docs = await db.enquiries.find().sort("created_at", -1).to_list(500)
    return [serialize_enquiry(d) for d in docs]


@api_router.patch("/enquiries/{enquiry_id}")
async def update_enquiry(enquiry_id: str, body: dict, admin=Depends(get_current_admin)):
    oid = to_oid(enquiry_id)
    status = body.get("status")
    if status not in ("new", "read"):
        raise HTTPException(status_code=400, detail="Invalid status")
    await db.enquiries.update_one({"_id": oid}, {"$set": {"status": status}})
    return {"message": "Updated"}


@api_router.delete("/enquiries/{enquiry_id}")
async def delete_enquiry(enquiry_id: str, admin=Depends(get_current_admin)):
    oid = to_oid(enquiry_id)
    result = await db.enquiries.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return {"message": "Deleted"}


# ---------------- Datasets ----------------

def sanitize_columns(df):
    counts = {}
    new_cols = []
    for c in df.columns:
        name = re.sub(r"[.$]", "_", str(c)).strip() or "column"
        if name in counts:
            counts[name] += 1
            name = f"{name}_{counts[name]}"
        else:
            counts[name] = 0
        new_cols.append(name)
    df.columns = new_cols


def clean_value(v):
    if v is None:
        return None
    if isinstance(v, np.bool_):
        return bool(v)
    if isinstance(v, (np.integer,)):
        return int(v)
    if isinstance(v, (np.floating,)):
        f = float(v)
        return None if (math.isnan(f) or math.isinf(f)) else f
    if isinstance(v, float):
        return None if (math.isnan(v) or math.isinf(v)) else v
    if isinstance(v, pd.Timestamp):
        return v.isoformat()
    try:
        if pd.isna(v):
            return None
    except (TypeError, ValueError):
        pass
    if isinstance(v, (int, str, bool)):
        return v
    return str(v)


def profile_dataframe(df):
    columns = []
    for col in df.columns:
        s = df[col]
        info = {
            "name": col,
            "dtype": str(s.dtype),
            "nulls": int(s.isna().sum()),
            "unique": int(s.nunique(dropna=True)),
        }
        if pd.api.types.is_numeric_dtype(s):
            clean = s.dropna()
            info["kind"] = "numeric"
            info["stats"] = {
                "sum": round(float(clean.sum()), 2) if len(clean) else 0,
                "mean": round(float(clean.mean()), 2) if len(clean) else 0,
                "min": round(float(clean.min()), 2) if len(clean) else 0,
                "max": round(float(clean.max()), 2) if len(clean) else 0,
            }
        else:
            info["kind"] = "text"
            top = s.dropna().astype(str).value_counts().head(5)
            info["top_values"] = [{"value": str(k), "count": int(v)} for k, v in top.items()]
        columns.append(info)
    return columns


@api_router.post("/datasets/upload", status_code=201)
async def upload_dataset(file: UploadFile = File(...), admin=Depends(get_current_admin)):
    filename = file.filename or "upload"
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ("csv", "xlsx", "xls"):
        raise HTTPException(status_code=400, detail="Only CSV, XLSX and XLS files are supported")
    content = await file.read()
    try:
        if ext == "csv":
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))
    except Exception:
        raise HTTPException(status_code=400, detail="Could not parse the file.")
    if df.empty:
        raise HTTPException(status_code=400, detail="The file contains no data")
    sanitize_columns(df)
    df = df.dropna(axis=0, how="all").dropna(axis=1, how="all")
    truncated = len(df) > MAX_ROWS
    if truncated:
        df = df.head(MAX_ROWS)
    for col in df.columns:
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            df[col] = df[col].astype(str).replace("NaT", None)
    columns_profile = profile_dataframe(df)
    doc = {
        "name": filename.rsplit(".", 1)[0],
        "filename": filename,
        "row_count": int(len(df)),
        "column_count": int(len(df.columns)),
        "columns": columns_profile,
        "truncated": truncated,
        "uploaded_by": admin["email"],
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.datasets.insert_one(doc)
    dsid = result.inserted_id

    # Memory Efficient Batched DB Insertions
    records = (
        {"dataset_id": dsid, "data": {k: clean_value(v) for k, v in row.items()}}
        for row in df.to_dict("records")
    )
    
    batch = []
    for record in records:
        batch.append(record)
        if len(batch) >= 1000:
            await db.dataset_rows.insert_many(batch)
            batch.clear()
    if batch:
        await db.dataset_rows.insert_many(batch)

    created = await db.datasets.find_one({"_id": dsid})
    return serialize_dataset(created)


@api_router.get("/datasets")
async def list_datasets(admin=Depends(get_current_admin)):
    docs = await db.datasets.find().sort("created_at", -1).to_list(200)
    return [serialize_dataset(d) for d in docs]


@api_router.get("/datasets/{dataset_id}")
async def get_dataset(dataset_id: str, admin=Depends(get_current_admin)):
    doc = await db.datasets.find_one({"_id": to_oid(dataset_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return serialize_dataset(doc)


@api_router.delete("/datasets/{dataset_id}")
async def delete_dataset(dataset_id: str, admin=Depends(get_current_admin)):
    oid = to_oid(dataset_id)
    result = await db.datasets.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Dataset not found")
    await db.dataset_rows.delete_many({"dataset_id": oid})
    return {"message": "Deleted"}


@api_router.get("/datasets/{dataset_id}/rows")
async def get_rows(
    dataset_id: str,
    skip: int = 0,
    limit: int = 25,
    sort: Optional[str] = None,
    order: str = "asc",
    q: Optional[str] = None,
    filters: Optional[str] = None,
    admin=Depends(get_current_admin),
):
    oid = to_oid(dataset_id)
    meta = await db.datasets.find_one({"_id": oid})
    if not meta:
        raise HTTPException(status_code=404, detail="Dataset not found")
    query = {"dataset_id": oid}
    and_clauses = []
    
    # ReDoS Protection & Escape Regex
    if q:
        if len(q) > 100:
            raise HTTPException(status_code=400, detail="Search query too long.")
        safe_q = re.escape(q.strip())
        or_clauses = []
        for col in meta.get("columns", []):
            if col["kind"] == "text":
                or_clauses.append({f"data.{col['name']}": {"$regex": safe_q, "$options": "i"}})
            else:
                try:
                    or_clauses.append({f"data.{col['name']}": float(q)})
                except ValueError:
                    pass
        if or_clauses:
            and_clauses.append({"$or": or_clauses})
            
    if filters:
        try:
            fdict = json.loads(filters)
        except json.JSONDecodeError:
            fdict = {}
        for key, value in fdict.items():
            if value in (None, ""):
                continue
            col_info = next((c for c in meta.get("columns", []) if c["name"] == key), None)
            if col_info and col_info["kind"] == "numeric":
                try:
                    and_clauses.append({f"data.{key}": float(value)})
                    continue
                except (ValueError, TypeError):
                    pass
            safe_val = re.escape(str(value)[:100])
            and_clauses.append({f"data.{key}": {"$regex": safe_val, "$options": "i"}})
            
    if and_clauses:
        query["$and"] = and_clauses
        
    limit = min(max(limit, 1), 100)
    skip = max(skip, 0)
    total = await db.dataset_rows.count_documents(query)
    cursor = db.dataset_rows.find(query)
    
    if sort and any(c["name"] == sort for c in meta.get("columns", [])):
        cursor = cursor.sort(f"data.{sort}", 1 if order == "asc" else -1)
    else:
        cursor = cursor.sort("_id", 1)
        
    docs = await cursor.skip(skip).limit(limit).to_list(limit)
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "rows": [{**d["data"]} for d in docs],
    }


@api_router.get("/datasets/{dataset_id}/aggregate")
async def aggregate_dataset(
    dataset_id: str,
    x: str,
    y: Optional[str] = None,
    agg: str = "sum",
    sort_by: str = "value",
    limit: int = 20,
    admin=Depends(get_current_admin),
):
    oid = to_oid(dataset_id)
    meta = await db.datasets.find_one({"_id": oid})
    if not meta:
        raise HTTPException(status_code=404, detail="Dataset not found")
    if y and agg in ("sum", "avg"):
        value_expr = {"$sum" if agg == "sum" else "$avg": f"$data.{y}"}
    else:
        value_expr = {"$sum": 1}
        agg = "count"
        y = None
    pipeline = [
        {"$match": {"dataset_id": oid, f"data.{x}": {"$ne": None}}},
        {"$group": {"_id": f"$data.{x}", "value": value_expr}},
        {"$sort": {"value": -1} if sort_by == "value" else {"_id": 1}},
        {"$limit": min(max(limit, 1), 50)},
    ]
    results = await db.dataset_rows.aggregate(pipeline).to_list(50)
    data = [
        {
            "label": str(r["_id"]),
            "value": round(float(r["value"]), 2) if isinstance(r["value"], (int, float)) else 0,
        }
        for r in results
    ]
    return {"x": x, "y": y, "agg": agg, "data": data}


@api_router.get("/datasets/{dataset_id}/export")
async def export_dataset(dataset_id: str, format: str = "csv", admin=Depends(get_current_admin)):
    oid = to_oid(dataset_id)
    meta = await db.datasets.find_one({"_id": oid})
    if not meta:
        raise HTTPException(status_code=404, detail="Dataset not found")
    docs = await db.dataset_rows.find({"dataset_id": oid}, {"data": 1}).to_list(MAX_ROWS)
    df = pd.DataFrame([d["data"] for d in docs])
    safe = re.sub(r"[^A-Za-z0-9_-]+", "_", meta["name"])
    if format == "xlsx":
        buf = io.BytesIO()
        with pd.ExcelWriter(buf, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name="Data")
        buf.seek(0)
        return StreamingResponse(
            buf,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f'attachment; filename="{safe}.xlsx"'},
        )
    buf = io.StringIO()
    df.to_csv(buf, index=False)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{safe}.csv"'},
    )


# ---------------- Dashboard & Samples ----------------

@api_router.get("/dashboard/stats")
async def dashboard_stats(admin=Depends(get_current_admin)):
    datasets = await db.datasets.find().sort("created_at", -1).to_list(200)
    total_rows = sum(d.get("row_count", 0) for d in datasets)
    total_enquiries = await db.enquiries.count_documents({})
    new_enquiries = await db.enquiries.count_documents({"status": "new"})
    recent_enquiries = await db.enquiries.find().sort("created_at", -1).to_list(5)
    numeric_cols = sum(1 for d in datasets for c in d.get("columns", []) if c.get("kind") == "numeric")
    return {
        "dataset_count": len(datasets),
        "total_rows": total_rows,
        "numeric_columns": numeric_cols,
        "total_enquiries": total_enquiries,
        "new_enquiries": new_enquiries,
        "recent_datasets": [serialize_dataset(d) for d in datasets[:5]],
        "recent_enquiries": [serialize_enquiry(e) for e in recent_enquiries],
    }


@api_router.get("/finance/sample")
async def finance_sample():
    seed = [
        ("Jan", 420, 180, 150), ("Feb", 450, 200, 170), ("Mar", 480, 220, 195),
        ("Apr", 505, 190, 210), ("May", 485, 240, 225), ("Jun", 500, 260, 240),
        ("Jul", 520, 230, 235), ("Aug", 515, 250, 260), ("Sep", 505, 270, 245),
        ("Oct", 530, 280, 270), ("Nov", 540, 300, 290), ("Dec", 550, 320, 310),
    ]
    unit_price = 1250
    monthly = []
    for month, opening, purchases, sales in seed:
        closing = opening + purchases - sales
        monthly.append({
            "month": month,
            "opening_stock": opening,
            "purchases": purchases,
            "sales": sales,
            "closing_stock": closing,
            "turnover": sales * unit_price,
        })
    total_turnover = sum(m["turnover"] for m in monthly)
    return {
        "currency": "INR",
        "unit_price": unit_price,
        "kpis": {
            "opening_stock": monthly[0]["opening_stock"],
            "closing_stock": monthly[-1]["closing_stock"],
            "total_purchases": sum(m["purchases"] for m in monthly),
            "total_sales": sum(m["sales"] for m in monthly),
            "total_turnover": total_turnover,
            "avg_monthly_turnover": round(total_turnover / len(monthly), 2),
        },
        "monthly": monthly,
    }


# --- APPLICATON ASSEMBLY & MIDDLEWARE ---

app.include_router(api_router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        "https://masterkeyanalysis.in",
        "https://www.masterkeyanalysis.in",
        "https://masterkey-website.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)
