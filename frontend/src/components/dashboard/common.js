import { useEffect, useState } from "react";
import api from "@/lib/api";

export function useDatasets() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const refresh = () => {
    setLoading(true);
    api.get("/datasets").then((r) => setDatasets(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(refresh, []);
  return { datasets, loading, refresh };
}

export function DatasetPicker({ datasets, value, onChange, testid = "dataset-picker" }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-testid={testid}
      className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-orange-500 min-w-[220px]"
    >
      <option value="">Select a dataset...</option>
      {datasets.map((d) => (
        <option key={d.id} value={d.id}>
          {d.name} ({d.row_count.toLocaleString()} rows)
        </option>
      ))}
    </select>
  );
}

export function KpiCard({ label, value, sub, icon: Icon, testid }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm" data-testid={testid}>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.15em] text-slate-400 font-semibold">{label}</span>
        {Icon && (
          <span className="w-9 h-9 rounded-lg bg-orange-50 grid place-items-center">
            <Icon className="w-4.5 h-4.5 w-5 h-5 text-orange-500" strokeWidth={1.75} />
          </span>
        )}
      </div>
      <div className="mt-3 font-display text-3xl md:text-4xl font-bold tracking-tight text-navy-800">{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

export function EmptyState({ title, hint, testid = "empty-state" }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-16 text-center" data-testid={testid}>
      <p className="font-display text-xl font-bold text-navy-800">{title}</p>
      <p className="mt-2 text-sm text-slate-400">{hint}</p>
    </div>
  );
}

export async function downloadBlob(url, filename) {
  const res = await api.get(url, { responseType: "blob" });
  const blobUrl = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
}

export const fmtNum = (n) =>
  typeof n === "number" ? new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n) : n;
