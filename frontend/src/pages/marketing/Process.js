import { FadeUp, SectionTag, LineMask } from "@/components/marketing/Reveal";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PROCESS } from "@/data/content";

export default function Process() {
  return (
    <>
      <section className="pt-40 pb-24" data-testid="process-hero">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <FadeUp><SectionTag>Our Process</SectionTag></FadeUp>
          <h1 className="mt-8 font-display text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.95]">
            <LineMask delay={0.2}>A method for</LineMask>
            <LineMask delay={0.35} className="text-orange-500">measurable value</LineMask>
          </h1>
        </div>
      </section>

      <section className="pb-28">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          {PROCESS.map((p, i) => (
            <FadeUp key={p.num} delay={i * 0.05}>
              <div
                className="group relative grid md:grid-cols-[200px_1fr] gap-6 md:gap-14 py-14 border-b border-white/10"
                data-testid={`process-step-${i}`}
              >
                <span className="font-display text-7xl md:text-9xl font-extrabold text-stroke group-hover:text-orange-500 group-hover:[-webkit-text-stroke:0px] transition-all duration-500 leading-none">
                  {p.num}
                </span>
                <div className="md:pt-4">
                  <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">{p.title}</h2>
                  <p className="mt-4 text-white/60 leading-relaxed max-w-xl">{p.desc}</p>
                </div>
              </div>
            </FadeUp>
          ))}
          <FadeUp delay={0.2} className="mt-16 text-center">
            <Link
              to="/contact"
              data-testid="process-cta-button"
              className="group inline-flex items-center gap-3 px-9 py-4 rounded-full bg-orange-500 text-navy-900 font-bold transition-[background-color,transform] duration-200 hover:bg-orange-400 hover:-translate-y-1"
            >
              Start Step 01 — Let's Understand
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
