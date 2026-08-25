import { useEffect, useMemo, useState } from "react";
import { Search, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import api from "@/lib/api";
import { useDatasets, DatasetPicker, EmptyState } from "@/components/dashboard/common";

const PAGE_SIZE = 15;
const selectCls = "rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-orange-500";

export default function Results() {
  const { datasets } = useDatasets();
  const [selected, setSelected] = useState("");
  const [detail, setDetail] = useState(null);
  const [q, setQ] = useState("");
  const [qInput, setQInput] = useState("");
  const [filterCol, setFilterCol] = useState("");
  const [filterVal, setFilterVal] = useState("");
  const [sort, setSort] = useState({ col: null, order: "asc" });
  const [page, setPage] = useState(0);
  const [data, setData] = useState({ total: 0, rows: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPage(0); setQ(""); setQInput(""); setFilterCol(""); setFilterVal(""); setSort({ col: null, order: "asc" });
    if (!selected) { setDetail(null); return; }
    api.get(`/datasets/${selected}`).then((r) => setDetail(r.data)).catch(() => {});
  }, [selected]);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    const params = new URLSearchParams({ skip: page * PAGE_SIZE, limit: PAGE_SIZE });
    if (q) params.set("q", q);
    if (sort.col) { params.set("sort", sort.col); params.set("order", sort.order); }
    if (filterCol && filterVal) params.set("filters", JSON.stringify({ [filterCol]: filterVal }));
    api.get(`/datasets/${selected}/rows?${params}`)
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selected, page, q, sort, filterCol, filterVal]);

  const columns = useMemo(() => (detail ? detail.columns.map((c) => c.name) : []), [detail]);
  const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));

  const toggleSort = (col) => {
    setPage(0);
    setSort((s) => s.col !== col ? { col, order: "asc" } : s.order === "asc" ? { col, order: "desc" } : { col: null, order: "asc" });
  };

  const search = (e) => {
    e.preventDefault();
    setPage(0);
    setQ(qInput.trim());
  };

  return (
    <div className="space-y-6" data-testid="results-page">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-navy-800">Detailed Results</h1>
          <p className="text-sm text-slate-400 mt-1">Search, filter, sort, and drill into every record</p>
        </div>
        <DatasetPicker datasets={datasets} value={selected} onChange={setSelected} />
      </div>

      {!selected && <EmptyState title="Select a dataset to explore its records" hint="Full-text search, column filters, and sorting included." />}

      {selected && (
        <>
          <div className="flex flex-wrap gap-3 items-center rounded-2xl bg-white border border-slate-200 p-4 shadow-sm" data-testid="results-controls">
            <form onSubmit={search} className="flex gap-2">
              <input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="Search all fields..."
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-500 w-56"
                data-testid="results-search-input"
              />
              <button type="submit" data-testid="results-search-button" className="rounded-lg bg-navy-800 text-white px-4 py-2.5 text-sm font-semibold hover:bg-navy-700 transition-colors duration-150">
                <Search className="w-4 h-4" />
              </button>
              {q && (
                <button type="button" onClick={() => { setQ(""); setQInput(""); }} data-testid="results-clear-search" className="rounded-lg border border-slate-200 px-3 text-slate-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
            <div className="flex gap-2 items-center">
              <select value={filterCol} onChange={(e) => { setFilterCol(e.target.value); setFilterVal(""); setPage(0); }} className={selectCls} data-testid="results-filter-column">
                <option value="">Filter column...</option>
                {columns.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {filterCol && (
                <input
                  value={filterVal}
                  onChange={(e) => { setFilterVal(e.target.value); setPage(0); }}
                  placeholder="value..."
                  className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500 w-36"
                  data-testid="results-filter-value"
                />
              )}
            </div>
            <span className="ml-auto text-xs text-slate-400" data-testid="results-total">{data.total.toLocaleString()} matching records</span>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden" data-testid="results-table-wrapper">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="results-table">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {columns.map((c) => (
                      <th key={c} onClick={() => toggleSort(c)} data-testid={`sort-${c}`} className="px-4 py-3 text-left font-semibold text-navy-800 cursor-pointer select-none whitespace-nowrap hover:text-orange-600 transition-colors duration-150">
                        <span className="inline-flex items-center gap-1.5">
                          {c}
                          {sort.col === c && (sort.order === "asc" ? <ArrowUp className="w-3 h-3 text-orange-500" /> : <ArrowDown className="w-3 h-3 text-orange-500" />)}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={columns.length} className="px-4 py-16 text-center"><div className="w-7 h-7 mx-auto border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></td></tr>
                  ) : data.rows.length === 0 ? (
                    <tr><td colSpan={columns.length} className="px-4 py-16 text-center text-slate-400 text-sm">No records match.</td></tr>
                  ) : (
                    data.rows.map((row, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-orange-50/40 transition-colors duration-100">
                        {columns.map((c) => (
                          <td key={c} className="px-4 py-3 text-slate-600 whitespace-nowrap max-w-[240px] truncate">
                            {row[c] === null || row[c] === undefined ? <span className="text-slate-300">—</span> : String(row[c])}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
              <span className="text-xs text-slate-400">Page {page + 1} of {pages}</span>
              <div className="flex gap-2">
                <button disabled={page === 0} onClick={() => setPage(page - 1)} data-testid="results-prev-page" className="rounded-lg border border-slate-200 p-2 text-slate-500 disabled:opacity-40 hover:border-orange-400 hover:text-orange-500 transition-colors duration-150">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button disabled={page >= pages - 1} onClick={() => setPage(page + 1)} data-testid="results-next-page" className="rounded-lg border border-slate-200 p-2 text-slate-500 disabled:opacity-40 hover:border-orange-400 hover:text-orange-500 transition-colors duration-150">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
