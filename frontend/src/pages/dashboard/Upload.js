import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { UploadCloud, FileSpreadsheet, Loader2, CheckCircle2, ArrowRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { useDatasets } from "@/components/dashboard/common";

export default function Upload() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const { datasets, refresh } = useDatasets();

  const pick = (f) => {
    if (!f) return;
    if (!/\.(csv|xlsx|xls)$/i.test(f.name)) {
      toast.error("Only CSV, XLSX and XLS files are supported");
      return;
    }
    setFile(f);
    setResult(null);
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post("/datasets/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / (e.total || 1))),
      });
      setResult(res.data);
      setFile(null);
      refresh();
      toast.success(`"${res.data.name}" uploaded — ${res.data.row_count.toLocaleString()} rows processed`);
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/datasets/${id}`);
      refresh();
      toast.success("Dataset deleted");
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  return (
    <div className="space-y-8" data-testid="upload-page">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-navy-800">Data Upload</h1>
        <p className="text-sm text-slate-400 mt-1">Upload Excel or CSV files — we validate, clean, and profile them automatically</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current?.click()}
        data-testid="upload-dropzone"
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-14 text-center transition-[border-color,background-color] duration-200 ${
          dragging ? "border-orange-500 bg-orange-50" : "border-slate-300 bg-white hover:border-orange-400"
        }`}
      >
        <UploadCloud className={`w-12 h-12 mx-auto mb-4 ${dragging ? "text-orange-500" : "text-slate-300"}`} strokeWidth={1.5} />
        <p className="font-display font-bold text-navy-800 text-lg">Drop your file here, or click to browse</p>
        <p className="text-sm text-slate-400 mt-2">CSV, XLSX, XLS · up to 20,000 rows per dataset</p>
        <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" data-testid="upload-file-input" onChange={(e) => pick(e.target.files[0])} />
      </div>

      {file && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 flex flex-wrap items-center justify-between gap-4" data-testid="upload-ready-file">
          <div className="flex items-center gap-4">
            <FileSpreadsheet className="w-8 h-8 text-orange-500" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-semibold text-navy-800">{file.name}</p>
              <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <button
            onClick={upload}
            disabled={uploading}
            data-testid="upload-submit-button"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-navy-900 transition-[background-color] duration-200 hover:bg-orange-400 disabled:opacity-60"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            {uploading ? `Processing... ${progress}%` : "Upload & Process"}
          </button>
        </div>
      )}

      {result && (
        <div className="rounded-2xl bg-white border-2 border-orange-200 p-8" data-testid="upload-success-card">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="w-6 h-6 text-orange-500" />
            <h2 className="font-display text-xl font-bold text-navy-800">"{result.name}" processed successfully</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[["Rows", result.row_count.toLocaleString()], ["Columns", result.column_count], ["Numeric", result.columns.filter((c) => c.kind === "numeric").length], ["Text", result.columns.filter((c) => c.kind === "text").length]].map(([l, v]) => (
              <div key={l} className="rounded-xl bg-slate-50 p-4">
                <div className="font-display text-2xl font-bold text-navy-800">{v}</div>
                <div className="text-xs uppercase tracking-widest text-slate-400 mt-1">{l}</div>
              </div>
            ))}
          </div>
          {result.truncated && <p className="text-xs text-amber-600 mb-4">Note: file was truncated to the first 20,000 rows.</p>}
          <Link to="/dashboard/analysis" data-testid="upload-analyze-link" className="inline-flex items-center gap-2 text-sm font-bold text-orange-600">
            Analyze this dataset <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      <section className="rounded-2xl bg-white border border-slate-200 shadow-sm" data-testid="upload-dataset-list">
        <header className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-display font-bold text-navy-800">Stored Datasets</h2>
        </header>
        {datasets.length === 0 ? (
          <p className="px-6 py-10 text-sm text-slate-400">Nothing uploaded yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {datasets.map((d) => (
              <li key={d.id} className="flex items-center justify-between px-6 py-4 gap-4" data-testid={`dataset-row-${d.id}`}>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy-800 truncate">{d.name}</p>
                  <p className="text-xs text-slate-400">{d.filename} · {d.row_count.toLocaleString()} rows · {d.column_count} columns</p>
                </div>
                <button onClick={() => remove(d.id)} data-testid={`delete-dataset-${d.id}`} className="text-slate-300 hover:text-red-500 transition-colors duration-200 shrink-0" aria-label="Delete dataset">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
