import { FadeUp, SectionTag, LineMask } from "@/components/marketing/Reveal";
import { Check } from "lucide-react";
import { SERVICES } from "@/data/content";

export default function Services() {
  return (
    <>
      <section className="pt-40 pb-24" data-testid="services-hero">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <FadeUp><SectionTag>Our Services</SectionTag></FadeUp>
          <h1 className="mt-8 font-display text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.95]">
            <LineMask delay={0.2}>Everything your data</LineMask>
            <LineMask delay={0.35} className="text-orange-500">needs to speak clearly</LineMask>
          </h1>
          <FadeUp delay={0.5}>
            <p className="mt-8 max-w-2xl text-white/60 leading-relaxed">
              From advanced Excel automation to Power BI dashboards and PostgreSQL solutions — we help
              businesses simplify data, improve efficiency, and unlock their true potential.
            </p>
          </FadeUp>
        </div>
      </section>

      <section className="pb-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-5">
          {SERVICES.map((s, i) => (
            <FadeUp key={s.title} delay={(i % 2) * 0.08}>
              <article
                data-testid={`service-detail-${i}`}
                className="tracing-beam h-full rounded-2xl bg-navy-800 border border-navy-700 p-8 md:p-10 transition-[transform] duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between gap-6">
                  <s.icon className="w-9 h-9 text-orange-500 shrink-0" strokeWidth={1.5} />
                  <span className="font-display text-5xl font-extrabold text-white/10">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h2 className="mt-6 font-display text-2xl font-bold tracking-tight">{s.title}</h2>
                <p className="mt-3 text-sm text-white/55 leading-relaxed">{s.tagline}</p>
                <ul className="mt-6 grid sm:grid-cols-2 gap-x-4 gap-y-2.5">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-white/70">
                      <Check className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" strokeWidth={2.5} />
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            </FadeUp>
          ))}
        </div>
      </section>
    </>
  );
}
