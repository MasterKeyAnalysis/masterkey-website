import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Database, Rows3, Sigma, MailWarning, UploadCloud, ArrowRight } from "lucide-react";
import api from "@/lib/api";
import { KpiCard } from "@/components/dashboard/common";

export default function Overview() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/dashboard/stats").then((r) => setStats(r.data)).catch(() => {});
  }, []);

  if (!stats) {
    return <div className="h-64 grid place-items-center" data-testid="overview-loading"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-8" data-testid="overview-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-navy-800">Overview</h1>
          <p className="text-sm text-slate-400 mt-1">Your analytics workspace at a glance</p>
        </div>
        <Link to="/dashboard/upload" data-testid="overview-upload-cta" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-navy-900 transition-[background-color] duration-200 hover:bg-orange-400">
          <UploadCloud className="w-4 h-4" /> Upload Data
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Datasets" value={stats.dataset_count} icon={Database} testid="kpi-datasets" sub="uploaded files" />
        <KpiCard label="Total Rows" value={stats.total_rows.toLocaleString()} icon={Rows3} testid="kpi-rows" sub="records stored" />
        <KpiCard label="Numeric Fields" value={stats.numeric_columns} icon={Sigma} testid="kpi-numeric" sub="across all datasets" />
        <KpiCard label="New Enquiries" value={stats.new_enquiries} icon={MailWarning} testid="kpi-enquiries" sub={`${stats.total_enquiries} total`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm" data-testid="recent-datasets">
          <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-display font-bold text-navy-800">Recent Datasets</h2>
            <Link to="/dashboard/analysis" className="text-xs font-semibold text-orange-500 inline-flex items-center gap-1">Analyze <ArrowRight className="w-3 h-3" /></Link>
          </header>
          {stats.recent_datasets.length === 0 ? (
            <p className="px-6 py-10 text-sm text-slate-400">No datasets yet — upload your first Excel or CSV file.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {stats.recent_datasets.map((d) => (
                <li key={d.id} className="flex items-center justify-between px-6 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy-800 truncate">{d.name}</p>
                    <p className="text-xs text-slate-400">{d.filename}</p>
                  </div>
                  <span className="text-xs font-medium text-slate-500 shrink-0 ml-4">{d.row_count.toLocaleString()} rows · {d.column_count} cols</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm" data-testid="recent-enquiries">
          <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-display font-bold text-navy-800">Recent Enquiries</h2>
            <Link to="/dashboard/admin" className="text-xs font-semibold text-orange-500 inline-flex items-center gap-1">Manage <ArrowRight className="w-3 h-3" /></Link>
          </header>
          {stats.recent_enquiries.length === 0 ? (
            <p className="px-6 py-10 text-sm text-slate-400">No enquiries yet — they arrive from the contact page.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {stats.recent_enquiries.map((e) => (
                <li key={e.id} className="px-6 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-navy-800 truncate">{e.name}</p>
                    <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${e.status === "new" ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500"}`}>{e.status}</span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-1">{e.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
