import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowDown, Phone } from "lucide-react";
import { LineMask, FadeUp, SectionTag, Marquee } from "@/components/marketing/Reveal";
import { SERVICES, MARQUEE_ITEMS, PROCESS, IMAGES, CONTACT } from "@/data/content";
import FinanceShowcase from "@/components/marketing/FinanceShowcase";

function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden grain" data-testid="hero-section">
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <img src={IMAGES.hero} alt="" className="w-full h-full object-cover scale-110" />
        <div className="absolute inset-0 bg-navy-900/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-navy-900/60" />
      </motion.div>

      <motion.div style={{ opacity: fade }} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-32 pb-24 w-full">
        <FadeUp delay={0.1}>
          <SectionTag>Unlocking Business Intelligence</SectionTag>
        </FadeUp>
        <h1 className="mt-8 font-display font-extrabold tracking-tighter leading-[0.95] text-6xl sm:text-7xl lg:text-[7.5rem]">
          <LineMask delay={0.25}>Data Insights.</LineMask>
          <LineMask delay={0.4} className="text-orange-500">Smart Solutions.</LineMask>
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 max-w-xl text-base md:text-lg text-white/70 leading-relaxed"
        >
          We combine data analytics, business intelligence, automation, and technology to help
          organizations work smarter and make informed decisions.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center gap-5"
        >
          <Link
            to="/contact"
            data-testid="hero-cta-button"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-orange-500 text-navy-900 font-bold transition-[background-color,transform] duration-200 hover:bg-orange-400 hover:-translate-y-1"
          >
            Start a Project
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <Link
            to="/services"
            data-testid="hero-services-button"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-white/25 text-white font-semibold transition-[border-color,background-color] duration-200 hover:border-orange-500 hover:bg-white/5"
          >
            Explore Services
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="mt-16 flex items-center gap-3 text-white/40 text-xs uppercase tracking-[0.3em]"
        >
          <ArrowDown className="w-4 h-4 animate-bounce" /> Scroll to unlock
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 60, rotate: 8 }}
        animate={{ opacity: 1, y: 0, rotate: 3 }}
        transition={{ duration: 1.1, delay: 1.15, ease: [0.16, 1, 0.3, 1] }}
        className="hidden 2xl:block absolute right-16 top-1/2 -translate-y-1/2 z-10"
        data-testid="hero-founder-photo"
      >
        <div className="absolute -inset-8 bg-orange-500/25 blur-3xl rounded-full" />
        <div className="relative w-72 rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
          <img src={IMAGES.founder} alt="Vasanth — Founder, Master Key Analysis" className="w-full aspect-[4/5] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="font-display font-bold text-lg leading-tight">Vasanth</p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-orange-400">Founder</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Approach() {
  const steps = [
    { num: "01", word: "Analyze", desc: "We dig into your raw data to find the story it tells." },
    { num: "02", word: "Automate", desc: "We remove repetitive manual work from your workflows." },
    { num: "03", word: "Visualize", desc: "We build dashboards that make the important things obvious." },
    { num: "04", word: "Optimize", desc: "We keep improving until the numbers move." },
  ];
  return (
    <section className="relative py-28 lg:py-40" data-testid="approach-section">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <FadeUp><SectionTag>Our Approach</SectionTag></FadeUp>
        <div className="mt-12 space-y-2">
          {steps.map((s, i) => (
            <FadeUp key={s.num} delay={i * 0.08}>
              <div className="group grid md:grid-cols-[140px_1fr_1.2fr] items-baseline gap-4 md:gap-10 py-8 border-b border-white/10 transition-[padding] duration-300 hover:pl-4">
                <span className="font-display text-6xl md:text-8xl font-extrabold text-stroke group-hover:text-orange-500 group-hover:[-webkit-text-stroke:0px] transition-all duration-300">
                  {s.num}
                </span>
                <h3 className="font-display text-3xl md:text-5xl font-bold tracking-tight">{s.word}</h3>
                <p className="text-white/55 leading-relaxed max-w-md">{s.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesPreview() {
  return (
    <section className="py-28 lg:py-36 bg-navy-800/40" data-testid="services-preview">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-16">
          <div>
            <FadeUp><SectionTag>What We Do</SectionTag></FadeUp>
            <FadeUp delay={0.1}>
              <h2 className="mt-6 font-display text-3xl md:text-5xl font-bold tracking-tight max-w-xl">
                Twelve capabilities. One goal — clarity.
              </h2>
            </FadeUp>
          </div>
          <FadeUp delay={0.2}>
            <Link to="/services" data-testid="view-all-services-link" className="group inline-flex items-center gap-2 text-orange-400 font-semibold">
              View all services <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </FadeUp>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.slice(0, 6).map((s, i) => (
            <FadeUp key={s.title} delay={i * 0.06}>
              <Link
                to="/services"
                data-testid={`service-card-${i}`}
                className="tracing-beam block h-full rounded-2xl bg-navy-800 border border-navy-700 p-8 transition-[transform,border-color] duration-300 hover:-translate-y-1.5"
              >
                <s.icon className="w-8 h-8 text-orange-500 mb-6" strokeWidth={1.75} />
                <h3 className="font-display text-xl font-bold tracking-tight mb-3">{s.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{s.tagline}</p>
              </Link>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessTeaser() {
  return (
    <section className="py-28 lg:py-36" data-testid="process-teaser">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <FadeUp><SectionTag>How We Work</SectionTag></FadeUp>
        <FadeUp delay={0.1}>
          <h2 className="mt-6 mb-16 font-display text-3xl md:text-5xl font-bold tracking-tight">Six steps from chaos to clarity</h2>
        </FadeUp>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14">
          {PROCESS.map((p, i) => (
            <FadeUp key={p.num} delay={i * 0.07}>
              <div className="relative pl-6 border-l border-white/15 group">
                <span className="absolute -left-px top-0 w-px h-8 bg-orange-500 transition-[height] duration-500 group-hover:h-full" />
                <span className="font-display text-sm font-bold text-orange-500 tracking-widest">{p.num}</span>
                <h3 className="mt-2 font-display text-2xl font-bold tracking-tight">{p.title}</h3>
                <p className="mt-3 text-sm text-white/55 leading-relaxed">{p.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function FounderTeaser() {
  return (
    <section className="py-28 lg:py-36 bg-navy-800/40 overflow-hidden" data-testid="founder-teaser">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-16 items-center">
        <FadeUp className="relative">
          <div className="relative rounded-3xl overflow-hidden aspect-[4/5] max-w-md">
            <img src={IMAGES.founder} alt="Vasanth, Founder of Master Key Analysis" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 to-transparent" />
          </div>
          <div className="absolute -bottom-6 -right-2 md:right-6 bg-orange-500 text-navy-900 rounded-2xl px-6 py-4 font-display font-bold tracking-tight shadow-2xl">
            Vasanth — Founder
          </div>
        </FadeUp>
        <div>
          <FadeUp><SectionTag>The Founder</SectionTag></FadeUp>
          <FadeUp delay={0.1}>
            <blockquote className="mt-8 font-display text-2xl md:text-4xl font-bold tracking-tight leading-snug">
              "Every business generates data. The real advantage comes from knowing how to
              <span className="text-orange-500"> understand it, automate it,</span> and turn it into meaningful action."
            </blockquote>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="mt-6 text-white/60 leading-relaxed max-w-lg">
              Vasanth founded Master Key Analysis to bridge the gap between complex business data
              and practical business decisions.
            </p>
          </FadeUp>
          <FadeUp delay={0.3}>
            <Link to="/founder" data-testid="founder-teaser-link" className="group mt-8 inline-flex items-center gap-2 text-orange-400 font-semibold">
              Meet the founder <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="relative py-28 overflow-hidden grain" data-testid="cta-band">
      <img src={IMAGES.analytics} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-navy-900/85" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 text-center">
        <FadeUp>
          <h2 className="font-display text-4xl md:text-6xl font-extrabold tracking-tighter leading-tight">
            Ready to unlock your data's<br className="hidden md:block" /> <span className="text-orange-500">true potential?</span>
          </h2>
        </FadeUp>
        <FadeUp delay={0.15}>
          <div className="mt-10 flex flex-wrap justify-center gap-5">
            <Link to="/contact" data-testid="cta-contact-button" className="inline-flex items-center gap-3 px-9 py-4 rounded-full bg-orange-500 text-navy-900 font-bold transition-[background-color,transform] duration-200 hover:bg-orange-400 hover:-translate-y-1">
              Let's Talk <ArrowRight className="w-4 h-4" />
            </Link>
            <a href={`tel:${CONTACT.phone}`} data-testid="cta-call-button" className="inline-flex items-center gap-3 px-9 py-4 rounded-full border border-white/25 font-semibold transition-[border-color,background-color] duration-200 hover:border-orange-500 hover:bg-white/5">
              <Phone className="w-4 h-4 text-orange-500" /> {CONTACT.phone}
            </a>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee items={MARQUEE_ITEMS} />
      <Approach />
      <ServicesPreview />
      <FinanceShowcase />
      <ProcessTeaser />
      <FounderTeaser />
      <CtaBand />
    </>
  );
}
