import { FadeUp, SectionTag, LineMask } from "@/components/marketing/Reveal";
import { Target, Eye } from "lucide-react";
import { IMAGES } from "@/data/content";

export default function About() {
  return (
    <>
      <section className="pt-40 pb-24 relative overflow-hidden grain" data-testid="about-hero">
        <img src={IMAGES.team} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/70 to-navy-900" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <FadeUp><SectionTag>About Us</SectionTag></FadeUp>
          <h1 className="mt-8 font-display text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.95]">
            <LineMask delay={0.2}>Turning Data Into</LineMask>
            <LineMask delay={0.35} className="text-orange-500">Business Intelligence</LineMask>
          </h1>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-16">
          <FadeUp>
            <p className="text-lg md:text-xl text-white/75 leading-relaxed">
              Master Key Analysis is a business analytics and technology solutions company founded by
              <span className="text-orange-400 font-semibold"> Vasanth</span>. We specialize in transforming raw and
              complex business data into meaningful information that supports better decision-making.
            </p>
            <p className="mt-6 text-white/55 leading-relaxed">
              Our solutions are designed for businesses that want to improve reporting, automate repetitive
              tasks, build powerful dashboards, manage databases, and streamline their operations. We believe
              technology should make business simpler, faster, and smarter.
            </p>
          </FadeUp>
          <div className="space-y-6">
            <FadeUp delay={0.1}>
              <div className="tracing-beam rounded-2xl bg-navy-800 border border-navy-700 p-10" data-testid="mission-card">
                <Target className="w-9 h-9 text-orange-500 mb-5" strokeWidth={1.75} />
                <h2 className="font-display text-2xl font-bold tracking-tight mb-3">Our Mission</h2>
                <p className="text-white/60 leading-relaxed">
                  To empower businesses with practical data-driven solutions that improve productivity,
                  visibility, and decision-making.
                </p>
              </div>
            </FadeUp>
            <FadeUp delay={0.2}>
              <div className="tracing-beam rounded-2xl bg-navy-800 border border-navy-700 p-10" data-testid="vision-card">
                <Eye className="w-9 h-9 text-orange-500 mb-5" strokeWidth={1.75} />
                <h2 className="font-display text-2xl font-bold tracking-tight mb-3">Our Vision</h2>
                <p className="text-white/60 leading-relaxed">
                  To become a trusted partner for businesses seeking intelligent analytics, automation,
                  and technology solutions.
                </p>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-navy-800/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center">
          <FadeUp><SectionTag>What We Believe</SectionTag></FadeUp>
          <FadeUp delay={0.1}>
            <p className="mt-8 font-display text-3xl md:text-5xl font-bold tracking-tight leading-tight max-w-4xl mx-auto">
              Technology should make business <span className="text-orange-500">simpler, faster, and smarter.</span>
            </p>
          </FadeUp>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden">
            {[["10+", "Services"], ["Finance", "Financial Analytics & Excel Stock Mgmt"], ["5", "Industries"], ["6", "Step Process"]].map(([n, l], i) => (
              <div key={l} className="bg-navy-900 p-10" data-testid={`stat-${i}`}>
                <div className="font-display text-5xl font-extrabold text-orange-500 tracking-tighter">{n}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.25em] text-white/50">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
