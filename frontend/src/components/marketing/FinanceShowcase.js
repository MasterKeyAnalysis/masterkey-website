import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { ArrowRight } from "lucide-react";
import { FadeUp, SectionTag } from "./Reveal";
import { API } from "@/lib/api";

const fmtINR = (n) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${new Intl.NumberFormat("en-IN").format(n)}`;

const tooltipStyle = {
  backgroundColor: "#0A1428",
  border: "1px solid #1A3059",
  borderRadius: "12px",
  fontSize: 12,
  color: "#fff",
};

export default function FinanceShowcase() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API}/finance/sample`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;
  const { kpis, monthly } = data;

  const cards = [
    ["Opening Stock", `${kpis.opening_stock} units`],
    ["Purchases", `${kpis.total_purchases.toLocaleString()} units`],
    ["Sales", `${kpis.total_sales.toLocaleString()} units`],
    ["Financial Turnover", fmtINR(kpis.total_turnover)],
  ];

  return (
    <section className="py-28 lg:py-36" data-testid="finance-showcase">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <FadeUp><SectionTag>Sample Insights</SectionTag></FadeUp>
        <div className="mt-6 mb-14 flex flex-wrap items-end justify-between gap-6">
          <FadeUp delay={0.1}>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight max-w-2xl">
              Financial analytics & Excel stock tracking, <span className="text-orange-500">visualized</span>
            </h2>
          </FadeUp>
          <FadeUp delay={0.2}>
            <Link to="/dashboard" data-testid="finance-showcase-cta" className="group inline-flex items-center gap-2 text-orange-400 font-semibold">
              Open the live dashboard <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </FadeUp>
        </div>

        <FadeUp delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6" data-testid="finance-kpi-row">
            {cards.map(([label, value], i) => (
              <div key={label} className="rounded-2xl bg-navy-800 border border-navy-700 p-6 relative overflow-hidden" data-testid={`finance-kpi-${i}`}>
                <span className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-semibold">{label}</p>
                <p className="mt-3 font-display text-2xl md:text-3xl font-bold tracking-tight text-white">{value}</p>
              </div>
            ))}
          </div>
        </FadeUp>

        <div className="grid lg:grid-cols-2 gap-5">
          <FadeUp delay={0.15}>
            <div className="rounded-2xl bg-navy-800 border border-navy-700 p-6 md:p-8" data-testid="stock-chart-card">
              <h3 className="font-display font-bold text-lg tracking-tight mb-1">Stock Movement</h3>
              <p className="text-xs text-white/40 mb-6">Opening stock vs purchases vs sales — monthly units</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthly} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A3059" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={{ stroke: "#1A3059" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(249,115,22,0.08)" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="opening_stock" name="Opening Stock" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="purchases" name="Purchases" fill="#FBBF24" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sales" name="Sales" fill="#F97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </FadeUp>
          <FadeUp delay={0.25}>
            <div className="rounded-2xl bg-navy-800 border border-navy-700 p-6 md:p-8" data-testid="turnover-chart-card">
              <h3 className="font-display font-bold text-lg tracking-tight mb-1">Financial Turnover</h3>
              <p className="text-xs text-white/40 mb-6">Monthly revenue trend (₹)</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthly} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A3059" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={{ stroke: "#1A3059" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 100000).toFixed(1)}L`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmtINR(v)} />
                  <Line type="monotone" dataKey="turnover" name="Turnover" stroke="#F97316" strokeWidth={3} dot={{ r: 3, fill: "#F97316" }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </FadeUp>
        </div>
        <FadeUp delay={0.3}>
          <p className="mt-6 text-xs text-white/35 uppercase tracking-[0.25em]">Sample data — your real files, analyzed the same way</p>
        </FadeUp>
      </div>
    </section>
  );
}
