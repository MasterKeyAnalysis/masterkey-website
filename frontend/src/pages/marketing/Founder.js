import { FadeUp, SectionTag, LineMask } from "@/components/marketing/Reveal";
import { BarChart3, Bot, LineChart, Database } from "lucide-react";
import { IMAGES } from "@/data/content";

const FOCUS = [
  { icon: BarChart3, label: "Analytics" },
  { icon: Bot, label: "Automation" },
  { icon: LineChart, label: "Business Intelligence" },
  { icon: Database, label: "Database Solutions" },
];

export default function Founder() {
  return (
    <>
      <section className="pt-40 pb-24" data-testid="founder-hero">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <FadeUp><SectionTag>Founder</SectionTag></FadeUp>
          <h1 className="mt-8 font-display text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.95]">
            <LineMask delay={0.2}>Vasanth</LineMask>
            <LineMask delay={0.35} className="text-white/30 text-3xl md:text-5xl font-bold tracking-tight mt-4">
              Founder, Master Key Analysis
            </LineMask>
          </h1>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-5 gap-16 items-start">
          <FadeUp className="lg:col-span-2 relative">
            <div className="rounded-3xl overflow-hidden aspect-[4/5]">
              <img src={IMAGES.founder} alt="Vasanth, Founder" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 to-transparent rounded-3xl" />
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {FOCUS.map((f) => (
                <div key={f.label} className="flex items-center gap-3 rounded-xl bg-navy-800 border border-navy-700 px-4 py-3">
                  <f.icon className="w-4 h-4 text-orange-500 shrink-0" />
                  <span className="text-sm font-medium text-white/80">{f.label}</span>
                </div>
              ))}
            </div>
          </FadeUp>
          <div className="lg:col-span-3">
            <FadeUp>
              <p className="text-lg text-white/75 leading-relaxed">
                Vasanth founded Master Key Analysis with a vision to help businesses make better use of their
                data and technology. With a strong focus on analytics, automation, business intelligence, and
                database solutions, he aims to bridge the gap between complex business data and practical
                business decisions.
              </p>
            </FadeUp>
            <FadeUp delay={0.15}>
              <div className="mt-12 rounded-3xl border border-orange-500/30 bg-orange-500/5 p-10 md:p-14 relative" data-testid="founder-message">
                <span className="absolute -top-6 left-10 font-display text-8xl text-orange-500 leading-none select-none">"</span>
                <h2 className="text-xs uppercase tracking-[0.3em] text-orange-400 font-semibold mb-6">Founder's Message</h2>
                <blockquote className="font-display text-2xl md:text-3xl font-bold tracking-tight leading-snug">
                  Every business generates data. The real advantage comes from knowing how to understand it,
                  automate it, and turn it into meaningful action.
                </blockquote>
                <p className="mt-8 text-white/60 leading-relaxed">
                  At Master Key Analysis, our goal is not simply to provide reports or technical solutions.
                  We aim to understand the business problem first and then build solutions that deliver
                  measurable value.
                </p>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>
    </>
  );
}
