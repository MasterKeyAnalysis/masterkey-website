import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];

export function LineMask({ children, delay = 0, className = "", as = "span" }) {
  return (
    <span className={`block overflow-hidden ${className}`}>
      <motion.span
        className="block"
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function FadeUp({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionTag({ children }) {
  return (
    <span className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-orange-500 font-semibold">
      <span className="w-8 h-px bg-orange-500" />
      {children}
    </span>
  );
}

export function Marquee({ items }) {
  return (
    <div className="overflow-hidden border-y border-white/10 py-6 select-none" data-testid="editorial-marquee">
      <div className="inline-flex whitespace-nowrap animate-marquee">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="inline-flex items-center gap-16 pr-16">
            <span className="font-display text-2xl md:text-3xl font-bold text-white/15 tracking-tight">{t}</span>
            <span className="w-2 h-2 rotate-45 bg-orange-500/60 inline-block" />
          </span>
        ))}
      </div>
    </div>
  );
}
