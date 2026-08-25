import { useEffect, useState } from "react";
import { FileDown, FileSpreadsheet, FileJson, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { useDatasets, DatasetPicker, EmptyState, downloadBlob, fmtNum } from "@/components/dashboard/common";

export default function Reports() {
  const { datasets } = useDatasets();
  const [selected, setSelected] = useState("");
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    if (!selected) { setDetail(null); return; }
    api.get(`/datasets/${selected}`).then((r) => setDetail(r.data)).catch(() => {});
  }, [selected]);

  const doExport = async (format) => {
    if (!detail) return;
    setBusy(format);
    try {
      await downloadBlob(`/datasets/${selected}/export?format=${format}`, `${detail.name}.${format}`);
      toast.success(`Exported ${detail.name}.${format}`);
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setBusy("");
    }
  };

  const exportSummary = () => {
    if (!detail) return;
    const summary = {
      dataset: detail.name,
      filename: detail.filename,
      exported_at: new Date().toISOString(),
      rows: detail.row_count,
      columns: detail.column_count,
      profile: detail.columns,
    };
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${detail.name}-analysis-summary.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Analysis summary downloaded");
  };

  const btnCls = "inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-[background-color,transform] duration-200 hover:-translate-y-0.5 disabled:opacity-60";

  return (
    <div className="space-y-8" data-testid="reports-page">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-navy-800">Reports & Export</h1>
          <p className="text-sm text-slate-400 mt-1">Download cleaned datasets and analysis summaries</p>
        </div>
        <DatasetPicker datasets={datasets} value={selected} onChange={setSelected} />
      </div>

      {!selected && <EmptyState title="Select a dataset to export" hint="Cleaned CSV, Excel, and a JSON analysis summary are available." />}

      {detail && (
        <div className="grid lg:grid-cols-2 gap-6">
          <section className="rounded-2xl bg-white border border-slate-200 p-8 shadow-sm" data-testid="export-panel">
            <h2 className="font-display text-xl font-bold text-navy-800 mb-2">{detail.name}</h2>
            <p className="text-sm text-slate-400 mb-8">{detail.row_count.toLocaleString()} rows · {detail.column_count} columns · uploaded {new Date(detail.created_at).toLocaleDateString()}</p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => doExport("csv")} disabled={!!busy} data-testid="export-csv-button" className={`${btnCls} bg-navy-800 text-white hover:bg-navy-700`}>
                {busy === "csv" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />} CSV
              </button>
              <button onClick={() => doExport("xlsx")} disabled={!!busy} data-testid="export-xlsx-button" className={`${btnCls} bg-orange-500 text-navy-900 hover:bg-orange-400`}>
                {busy === "xlsx" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />} Excel
              </button>
              <button onClick={exportSummary} data-testid="export-summary-button" className={`${btnCls} border border-slate-200 text-slate-600 hover:border-orange-400 hover:text-orange-600`}>
                <FileJson className="w-4 h-4" /> Analysis Summary
              </button>
            </div>
          </section>

          <section className="rounded-2xl bg-navy-800 p-8 text-white shadow-sm" data-testid="report-summary-panel">
            <h2 className="font-display text-xl font-bold mb-6">Key Figures</h2>
            <ul className="space-y-4">
              {detail.columns.filter((c) => c.kind === "numeric").slice(0, 5).map((c) => (
                <li key={c.name} className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <span className="text-sm text-white/60 truncate">{c.name}</span>
                  <span className="font-display font-bold text-orange-400 whitespace-nowrap">{fmtNum(c.stats.sum)}</span>
                </li>
              ))}
              {detail.columns.every((c) => c.kind !== "numeric") && (
                <li className="text-sm text-white/50">No numeric fields in this dataset.</li>
              )}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
