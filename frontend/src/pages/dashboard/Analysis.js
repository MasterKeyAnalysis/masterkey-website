import { useEffect, useState } from "react";
import { Hash, Type } from "lucide-react";
import api from "@/lib/api";
import { useDatasets, DatasetPicker, KpiCard, EmptyState, fmtNum } from "@/components/dashboard/common";
import { Rows3, Columns3, Sigma, AlertCircle } from "lucide-react";

export default function Analysis() {
  const { datasets } = useDatasets();
  const [selected, setSelected] = useState("");
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selected) { setDetail(null); return; }
    setLoading(true);
    api.get(`/datasets/${selected}`).then((r) => setDetail(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [selected]);

  const totalNulls = detail ? detail.columns.reduce((a, c) => a + c.nulls, 0) : 0;
  const numericCount = detail ? detail.columns.filter((c) => c.kind === "numeric").length : 0;

  return (
    <div className="space-y-8" data-testid="analysis-page">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-navy-800">Data Analysis</h1>
          <p className="text-sm text-slate-400 mt-1">Profile, statistics, and data quality for any dataset</p>
        </div>
        <DatasetPicker datasets={datasets} value={selected} onChange={setSelected} />
      </div>

      {!selected && <EmptyState title="Select a dataset to analyze" hint="Upload one first on the Data Upload page if the list is empty." />}

      {loading && <div className="h-48 grid place-items-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}

      {detail && !loading && (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4" data-testid="analysis-kpis">
            <KpiCard label="Rows" value={detail.row_count.toLocaleString()} icon={Rows3} testid="kpi-rows" />
            <KpiCard label="Columns" value={detail.column_count} icon={Columns3} testid="kpi-columns" />
            <KpiCard label="Numeric Fields" value={numericCount} icon={Sigma} testid="kpi-numeric" />
            <KpiCard label="Missing Values" value={totalNulls.toLocaleString()} icon={AlertCircle} testid="kpi-nulls" sub={totalNulls === 0 ? "clean data" : "needs attention"} />
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="column-profiles">
            {detail.columns.map((c) => (
              <div key={c.name} className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm" data-testid={`column-card-${c.name}`}>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="font-display font-bold text-navy-800 truncate">{c.name}</h3>
                  <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full shrink-0 ${c.kind === "numeric" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"}`}>
                    {c.kind === "numeric" ? <Hash className="w-3 h-3" /> : <Type className="w-3 h-3" />}
                    {c.kind}
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-slate-400 mb-4">
                  <span>{c.unique.toLocaleString()} unique</span>
                  <span>{c.nulls.toLocaleString()} missing</span>
                </div>
                {c.kind === "numeric" ? (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[["Sum", c.stats.sum], ["Mean", c.stats.mean], ["Min", c.stats.min], ["Max", c.stats.max]].map(([l, v]) => (
                      <div key={l} className="rounded-lg bg-slate-50 px-3 py-2">
                        <span className="block text-[10px] uppercase tracking-widest text-slate-400">{l}</span>
                        <span className="font-semibold text-navy-800">{fmtNum(v)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {(c.top_values || []).map((t) => {
                      const pct = detail.row_count ? Math.min(100, (t.count / detail.row_count) * 100) : 0;
                      return (
                        <li key={t.value}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-600 truncate max-w-[70%]">{t.value}</span>
                            <span className="text-slate-400">{t.count}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-orange-500" style={{ width: `${pct}%` }} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
