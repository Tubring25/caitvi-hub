import { motion } from "motion/react";

const TRANSITION = {
  duration: 0.8,
  ease: [0.16, 1, 0.3, 1] as const,
};

function stagger(index: number) {
  return { ...TRANSITION, delay: 0.15 * index };
}

export default function TransitionSection() {
  return (
    <section className="relative w-full py-28 sm:py-36 overflow-hidden">
      {/* Ambient glow — subtle brand warmth */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.04]"
        style={{ background: "var(--lesbian-pink)" }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        {/* Brand gradient line */}
        <motion.div
          initial={{ scaleX: 0, originX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={stagger(0)}
          className="w-20 sm:w-28 h-[2px] mb-8 sm:mb-10"
          style={{ background: "var(--brand-gradient-soft)" }}
          aria-hidden="true"
        />

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={stagger(1)}
          className="font-serif italic text-[clamp(1.4rem,3vw+0.5rem,2.4rem)] leading-[1.3] text-white/80 max-w-lg"
        >
          Can you hear me?
        </motion.p>

        {/* Sub-copy */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={stagger(2)}
          className="mt-4 sm:mt-5 text-sm sm:text-base font-sans text-white/40 max-w-md leading-relaxed"
        >
          Curated from the vast CaitVi archive — every story here earned its place on the shelf.
        </motion.p>
      </div>
    </section>
  );
}
