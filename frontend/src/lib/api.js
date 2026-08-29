import axios from "axios";

// 1. Get raw backend URL from env or fallback string
let rawUrl =
  process.env.REACT_APP_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://masterkey-website-1.onrender.com";

// 2. Remove any accidental Markdown brackets/parentheses if present
if (rawUrl.includes("[")) {
  const match = rawUrl.match(/https?:\/\/[^\s\)\"]+/);
  if (match) rawUrl = match[0];
}

// 3. Remove trailing slash or trailing /api
export const API = rawUrl.replace(/\/+$/, "").replace(/\/api$/, "");

const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mka_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function formatApiError(err) {
  const detail = err?.response?.data?.detail;
  if (detail == null) return err?.message || "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export default api;
