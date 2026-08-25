import { FadeUp, SectionTag, LineMask } from "@/components/marketing/Reveal";
import { CheckCircle2, Factory, Store, MonitorSmartphone, HeartPulse, Briefcase, FileSpreadsheet, Filter, LineChart, Layers, Bot, Database } from "lucide-react";
import { WHY_US, EXPERTISE, INDUSTRIES } from "@/data/content";

const INDUSTRY_ICONS = [Factory, Store, MonitorSmartphone, HeartPulse, Briefcase];
const EXPERTISE_ICONS = [FileSpreadsheet, Filter, LineChart, Layers, Bot, Database];

export default function WhyUs() {
  return (
    <>
      <section className="pt-40 pb-24" data-testid="whyus-hero">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <FadeUp><SectionTag>Why Choose Us</SectionTag></FadeUp>
          <h1 className="mt-8 font-display text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.95]">
            <LineMask delay={0.2}>Built on trust.</LineMask>
            <LineMask delay={0.35} className="text-orange-500">Measured in results.</LineMask>
          </h1>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {WHY_US.map((w, i) => (
            <FadeUp key={w.title} delay={i * 0.06}>
              <div className="tracing-beam h-full rounded-2xl bg-navy-800 border border-navy-700 p-8 transition-[transform] duration-300 hover:-translate-y-1" data-testid={`why-card-${i}`}>
                <CheckCircle2 className="w-7 h-7 text-orange-500 mb-5" strokeWidth={1.75} />
                <h3 className="font-display text-xl font-bold tracking-tight mb-3">{w.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{w.text}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      <section className="py-24 bg-navy-800/40" data-testid="expertise-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <FadeUp><SectionTag>Technology & Expertise</SectionTag></FadeUp>
          <FadeUp delay={0.1}>
            <h2 className="mt-6 mb-14 font-display text-3xl md:text-5xl font-bold tracking-tight">The tools we master</h2>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
            {EXPERTISE.map((e, i) => {
              const Icon = EXPERTISE_ICONS[i];
              return (
                <FadeUp key={e.name} delay={i * 0.05}>
                  <div className="flex gap-6 group" data-testid={`expertise-${i}`}>
                    <div className="w-14 h-14 rounded-xl bg-navy-800 border border-navy-700 grid place-items-center shrink-0 transition-[border-color] duration-300 group-hover:border-orange-500">
                      <Icon className="w-6 h-6 text-orange-500" strokeWidth={1.75} />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold tracking-tight">{e.name}</h3>
                      <p className="mt-2 text-sm text-white/55 leading-relaxed">{e.desc}</p>
                    </div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24" data-testid="industries-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <FadeUp><SectionTag>Industries We Serve</SectionTag></FadeUp>
          <FadeUp delay={0.1}>
            <h2 className="mt-6 mb-14 font-display text-3xl md:text-5xl font-bold tracking-tight">Wherever data lives, we work</h2>
          </FadeUp>
          <div className="space-y-0">
            {INDUSTRIES.map((ind, i) => {
              const Icon = INDUSTRY_ICONS[i];
              return (
                <FadeUp key={ind.name} delay={i * 0.05}>
                  <div className="group grid md:grid-cols-[80px_1fr_1.5fr] items-center gap-4 md:gap-10 py-8 border-b border-white/10 transition-[padding] duration-300 hover:pl-4" data-testid={`industry-${i}`}>
                    <Icon className="w-8 h-8 text-orange-500" strokeWidth={1.5} />
                    <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight">{ind.name}</h3>
                    <p className="text-white/55 text-sm leading-relaxed">{ind.desc}</p>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
