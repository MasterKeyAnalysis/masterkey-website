import axios from "axios";

// Remove trailing /api here to avoid double-prefix issues
const BASE_URL = process.env.REACT_APP_BACKEND_URL || 
                 process.env.NEXT_PUBLIC_API_URL || 
                 "https://masterkey-website-1.onrender.com";

export const API = BASE_URL.replace(/\/api\/?$/, ""); // Standardizes base URL

const api = axios.create({ 
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
  }
});

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
