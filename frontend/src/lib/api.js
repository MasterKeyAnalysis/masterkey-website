import axios from "axios";

// Clean raw URL fallback to use environment variables or Vercel backend
const RAW_URL = process.env.REACT_APP_API_URL || process.env.NEXT_PUBLIC_API_URL || "https://backend-beta-kohl-15.vercel.app";

export const API = RAW_URL.replace(/\/+$/, "").replace(/\/api$/, "");

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
