from dotenv import load_dotenv
load_dotenv()

import os
import io
import re
import json
import math
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

import bcrypt
import jwt
import numpy as np
import pandas as pd
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, UploadFile, File
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI()
api_router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)
JWT_ALGORITHM = "HS256"
MAX_ROWS = 20000


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


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
    token = None
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth[7:]
    if not token:
        token = request.cookies.get("access_token")
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


@api_router.get("/")
async def root():
    return {"message": "Master Key Analysis API"}


# ---------------- Auth ----------------

@api_router.post("/auth/login")
async def login(input: LoginInput, request: Request):
    email = input.email.lower()
    identifier = f"{request.client.host}:{email}"
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
        raise HTTPException(status_code=400, detail="Could not parse the file. Please check its format.")
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
    records = [
        {"dataset_id": dsid, "data": {k: clean_value(v) for k, v in row.items()}}
        for row in df.to_dict("records")
    ]
    for i in range(0, len(records), 1000):
        await db.dataset_rows.insert_many(records[i:i + 1000])
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
    if q:
        or_clauses = []
        for col in meta.get("columns", []):
            if col["kind"] == "text":
                or_clauses.append({f"data.{col['name']}": {"$regex": re.escape(q), "$options": "i"}})
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
            and_clauses.append({f"data.{key}": {"$regex": re.escape(str(value)), "$options": "i"}})
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


# ---------------- Dashboard ----------------

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


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.dataset_rows.create_index("dataset_id")
    await db.login_attempts.create_index("identifier")
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@masterkeyanalysis.in").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "MasterKey@2026")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one(
            {
                "email": admin_email,
                "password_hash": hash_password(admin_password),
                "name": "Vasanth",
                "role": "admin",
                "created_at": datetime.now(timezone.utc),
            }
        )
        logger.info(f"Seeded admin user {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}}
        )


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
