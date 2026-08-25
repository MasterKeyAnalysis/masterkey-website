import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import api from "@/lib/api";
import { useDatasets, DatasetPicker, EmptyState, fmtNum } from "@/components/dashboard/common";

const COLORS = ["#F97316", "#3B82F6", "#122340", "#FBBF24", "#10B981", "#8B5CF6", "#EC4899", "#14B8A6"];
const CHART_TYPES = [["bar", "Bar"], ["line", "Line"], ["area", "Area"], ["pie", "Pie"]];
const selectCls = "rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-orange-500";

export default function ChartsPage() {
  const { datasets } = useDatasets();
  const [selected, setSelected] = useState("");
  const [detail, setDetail] = useState(null);
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [agg, setAgg] = useState("sum");
  const [type, setType] = useState("bar");
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selected) { setDetail(null); return; }
    api.get(`/datasets/${selected}`).then((r) => {
      setDetail(r.data);
      const firstText = r.data.columns.find((c) => c.kind === "text");
      const firstNum = r.data.columns.find((c) => c.kind === "numeric");
      setX(firstText?.name || r.data.columns[0]?.name || "");
      setY(firstNum?.name || "");
    }).catch(() => {});
  }, [selected]);

  const numericCols = useMemo(() => (detail ? detail.columns.filter((c) => c.kind === "numeric") : []), [detail]);

  useEffect(() => {
    if (!selected || !x) { setChartData(null); return; }
    setLoading(true);
    const params = new URLSearchParams({ x, agg });
    if (y) params.set("y", y);
    params.set("sort_by", type === "line" || type === "area" ? "label" : "value");
    api.get(`/datasets/${selected}/aggregate?${params}`)
      .then((r) => setChartData(r.data.data))
      .catch(() => setChartData([]))
      .finally(() => setLoading(false));
  }, [selected, x, y, agg, type]);

  const renderChart = () => {
    const common = { data: chartData, margin: { top: 10, right: 20, bottom: 40, left: 10 } };
    const axes = (
      <>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748B" }} angle={-25} textAnchor="end" interval={0} height={60} />
        <YAxis tick={{ fontSize: 11, fill: "#64748B" }} tickFormatter={(v) => fmtNum(v)} width={80} />
        <Tooltip formatter={(v) => fmtNum(v)} />
      </>
    );
    if (type === "line")
      return <LineChart {...common}>{axes}<Line type="monotone" dataKey="value" stroke="#F97316" strokeWidth={2.5} dot={{ r: 3, fill: "#F97316" }} /></LineChart>;
    if (type === "area")
      return <AreaChart {...common}>{axes}<Area type="monotone" dataKey="value" stroke="#F97316" fill="#F97316" fillOpacity={0.15} strokeWidth={2.5} /></AreaChart>;
    if (type === "pie")
      return (
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="label" innerRadius="45%" outerRadius="75%" paddingAngle={2}>
            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v) => fmtNum(v)} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      );
    return (
      <BarChart {...common}>
        {axes}
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    );
  };

  return (
    <div className="space-y-8" data-testid="charts-page">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-navy-800">Charts & Visualizations</h1>
        <p className="text-sm text-slate-400 mt-1">Build interactive charts from any dataset</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center rounded-2xl bg-white border border-slate-200 p-4 shadow-sm" data-testid="chart-controls">
        <DatasetPicker datasets={datasets} value={selected} onChange={setSelected} />
        {detail && (
          <>
            <select value={x} onChange={(e) => setX(e.target.value)} className={selectCls} data-testid="chart-x-select">
              {detail.columns.map((c) => <option key={c.name} value={c.name}>X: {c.name}</option>)}
            </select>
            <select value={y} onChange={(e) => setY(e.target.value)} className={selectCls} data-testid="chart-y-select">
              <option value="">Count of rows</option>
              {numericCols.map((c) => <option key={c.name} value={c.name}>Y: {c.name}</option>)}
            </select>
            {y && (
              <select value={agg} onChange={(e) => setAgg(e.target.value)} className={selectCls} data-testid="chart-agg-select">
                <option value="sum">Sum</option>
                <option value="avg">Average</option>
              </select>
            )}
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              {CHART_TYPES.map(([t, label]) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  data-testid={`chart-type-${t}`}
                  className={`px-4 py-2.5 text-sm font-semibold transition-[background-color,color] duration-150 ${type === t ? "bg-navy-800 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {!selected && <EmptyState title="Select a dataset to visualize" hint="Choose a file, pick X and Y fields, and the chart builds itself." />}

      {selected && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm" data-testid="chart-canvas">
          {loading ? (
            <div className="h-[420px] grid place-items-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={420}>{renderChart()}</ResponsiveContainer>
          ) : (
            <p className="h-[420px] grid place-items-center text-sm text-slate-400">No data for this combination — try different fields.</p>
          )}
        </div>
      )}
    </div>
  );
}
