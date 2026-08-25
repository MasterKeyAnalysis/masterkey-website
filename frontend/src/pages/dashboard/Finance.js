import { useEffect, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { Boxes, ShoppingCart, TrendingUp, IndianRupee } from "lucide-react";
import api from "@/lib/api";

const fmtINR = (n) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${new Intl.NumberFormat("en-IN").format(n)}`;

const tooltipStyle = {
  backgroundColor: "#0A1428",
  border: "1px solid #1A3059",
  borderRadius: "12px",
  fontSize: 12,
  color: "#fff",
};

function DarkKpi({ label, value, sub, icon: Icon, testid }) {
  return (
    <div className="rounded-2xl bg-navy-800 border border-navy-700 p-6 relative overflow-hidden" data-testid={testid}>
      <span className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-semibold">{label}</span>
        <span className="w-9 h-9 rounded-lg bg-orange-500/15 grid place-items-center">
          <Icon className="w-4 h-4 text-orange-400" strokeWidth={1.75} />
        </span>
      </div>
      <div className="mt-3 font-display text-3xl font-bold tracking-tight text-white">{value}</div>
      {sub && <div className="mt-1 text-xs text-white/40">{sub}</div>}
    </div>
  );
}

function ChartCard({ title, sub, testid, children }) {
  return (
    <div className="rounded-2xl bg-navy-800 border border-navy-700 p-6" data-testid={testid}>
      <h3 className="font-display font-bold text-lg tracking-tight text-white mb-1">{title}</h3>
      <p className="text-xs text-white/40 mb-6">{sub}</p>
      {children}
    </div>
  );
}

const axisProps = {
  tick: { fontSize: 11, fill: "#94A3B8" },
  axisLine: { stroke: "#1A3059" },
  tickLine: false,
};

export default function Finance() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/finance/sample").then((r) => setData(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6" data-testid="finance-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-navy-800">Financial Insights</h1>
          <p className="text-sm text-slate-400 mt-1">Opening stock, purchases, sales & turnover — Power BI style</p>
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-orange-600 bg-orange-100 rounded-full px-3 py-1.5" data-testid="sample-data-badge">
          Sample data
        </span>
      </div>

      {!data ? (
        <div className="h-64 grid place-items-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="rounded-3xl bg-navy-900 border border-navy-700 p-5 lg:p-8 space-y-5" data-testid="powerbi-panel">
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4" data-testid="finance-kpis">
            <DarkKpi label="Opening Stock" value={`${data.kpis.opening_stock} units`} sub={`closing: ${data.kpis.closing_stock} units`} icon={Boxes} testid="fkpi-opening" />
            <DarkKpi label="Purchases" value={data.kpis.total_purchases.toLocaleString()} sub="units purchased YTD" icon={ShoppingCart} testid="fkpi-purchases" />
            <DarkKpi label="Sales" value={data.kpis.total_sales.toLocaleString()} sub="units sold YTD" icon={TrendingUp} testid="fkpi-sales" />
            <DarkKpi label="Financial Turnover" value={fmtINR(data.kpis.total_turnover)} sub={`avg ${fmtINR(data.kpis.avg_monthly_turnover)} / month`} icon={IndianRupee} testid="fkpi-turnover" />
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <ChartCard title="Turnover Trend" sub="Monthly financial turnover (₹)" testid="finance-turnover-chart">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.monthly} margin={{ top: 5, right: 10, bottom: 0, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A3059" />
                  <XAxis dataKey="month" {...axisProps} />
                  <YAxis {...axisProps} axisLine={false} tickFormatter={(v) => `${(v / 100000).toFixed(1)}L`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmtINR(v)} />
                  <Line type="monotone" dataKey="turnover" name="Turnover" stroke="#F97316" strokeWidth={3} dot={{ r: 3, fill: "#F97316" }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Stock Movement" sub="Opening stock vs purchases vs sales (units)" testid="finance-stock-chart">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.monthly} margin={{ top: 5, right: 10, bottom: 0, left: -15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A3059" />
                  <XAxis dataKey="month" {...axisProps} />
                  <YAxis {...axisProps} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(249,115,22,0.08)" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="opening_stock" name="Opening Stock" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="purchases" name="Purchases" fill="#FBBF24" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sales" name="Sales" fill="#F97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard title="Closing Stock Position" sub="Month-end inventory level (units)" testid="finance-closing-chart">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data.monthly} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A3059" />
                <XAxis dataKey="month" {...axisProps} />
                <YAxis {...axisProps} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="closing_stock" name="Closing Stock" stroke="#FBBF24" fill="#FBBF24" fillOpacity={0.15} strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
}
