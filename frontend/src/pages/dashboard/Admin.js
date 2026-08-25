import { useEffect, useState } from "react";
import { MailOpen, Mail, Trash2, Phone, Database } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { useDatasets } from "@/components/dashboard/common";

export default function Admin() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { datasets, refresh } = useDatasets();

  const load = () => {
    setLoading(true);
    api.get("/enquiries").then((r) => setEnquiries(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggleStatus = async (e) => {
    try {
      await api.patch(`/enquiries/${e.id}`, { status: e.status === "new" ? "read" : "new" });
      load();
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  const removeEnquiry = async (id) => {
    try {
      await api.delete(`/enquiries/${id}`);
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
      toast.success("Enquiry deleted");
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  const removeDataset = async (id) => {
    try {
      await api.delete(`/datasets/${id}`);
      refresh();
      toast.success("Dataset deleted");
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  return (
    <div className="space-y-8" data-testid="admin-page">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-navy-800">Admin</h1>
        <p className="text-sm text-slate-400 mt-1">Review website enquiries and manage stored datasets</p>
      </div>

      <section className="rounded-2xl bg-white border border-slate-200 shadow-sm" data-testid="enquiries-panel">
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-display font-bold text-navy-800">Contact Enquiries</h2>
          <span className="text-xs font-semibold text-orange-600 bg-orange-100 rounded-full px-3 py-1" data-testid="new-count-badge">
            {enquiries.filter((e) => e.status === "new").length} new
          </span>
        </header>
        {loading ? (
          <div className="py-14 grid place-items-center"><div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : enquiries.length === 0 ? (
          <p className="px-6 py-10 text-sm text-slate-400">No enquiries yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {enquiries.map((e) => (
              <li key={e.id} className="px-6 py-5" data-testid={`enquiry-item-${e.id}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-navy-800 text-sm">{e.name}</span>
                      <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${e.status === "new" ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500"}`}>{e.status}</span>
                      {e.service && <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">{e.service}</span>}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {e.email}{e.phone && <> · <Phone className="inline w-3 h-3" /> {e.phone}</>} · {new Date(e.created_at).toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{e.message}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => toggleStatus(e)} data-testid={`toggle-enquiry-${e.id}`} className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:text-orange-500 hover:border-orange-300 transition-colors duration-150" title={e.status === "new" ? "Mark read" : "Mark new"}>
                      {e.status === "new" ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    </button>
                    <button onClick={() => removeEnquiry(e.id)} data-testid={`delete-enquiry-${e.id}`} className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:text-red-500 hover:border-red-300 transition-colors duration-150" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl bg-white border border-slate-200 shadow-sm" data-testid="admin-datasets-panel">
        <header className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-display font-bold text-navy-800">Stored Datasets</h2>
        </header>
        {datasets.length === 0 ? (
          <p className="px-6 py-10 text-sm text-slate-400">No datasets stored.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {datasets.map((d) => (
              <li key={d.id} className="flex items-center justify-between px-6 py-4 gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <Database className="w-5 h-5 text-orange-500 shrink-0" strokeWidth={1.75} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy-800 truncate">{d.name}</p>
                    <p className="text-xs text-slate-400">{d.row_count.toLocaleString()} rows · {d.column_count} columns · by {d.uploaded_by}</p>
                  </div>
                </div>
                <button onClick={() => removeDataset(d.id)} data-testid={`admin-delete-dataset-${d.id}`} className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:text-red-500 hover:border-red-300 transition-colors duration-150 shrink-0" title="Delete">
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
