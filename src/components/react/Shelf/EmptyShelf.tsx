import { motion } from "motion/react";

const EXPO_EASE = [0.16, 1, 0.3, 1] as const;

function GhostSpine({
  width = 48,
  height,
  delay,
}: {
  width?: number;
  height: number;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: EXPO_EASE }}
      className="rounded-sm border border-dashed border-white/[0.08] relative overflow-hidden"
      style={{ width, height }}
    >
      {/* Top rating hint bar */}
      <div className="absolute top-0 inset-x-0 h-[3px] bg-white/[0.06]" />
      {/* Left spine edge */}
      <div className="absolute top-0 left-0 bottom-0 w-[2px] bg-white/[0.04]" />
    </motion.div>
  );
}

export function EmptyShelf() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      {/* Ghost book spines */}
      <div className="flex items-end gap-3 mb-3">
        <GhostSpine height={140} delay={0.1} />
        <GhostSpine width={32} height={180} delay={0.15} />
        <GhostSpine width={40} height={120} delay={0.2} />
        <GhostSpine width={56} height={160} delay={0.25} />
        <GhostSpine height={130} delay={0.3} />
      </div>

      {/* Faded shelf line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: EXPO_EASE }}
        className="w-72 h-[2px] bg-gradient-to-r from-transparent via-[#D462A6]/[0.15] to-transparent origin-center mb-12"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: EXPO_EASE }}
        className="text-center"
      >
        <h2 className="text-xl sm:text-2xl font-serif text-white mb-3">
          Your shelf is empty
        </h2>
        <p className="text-sm sm:text-base text-white/50 font-sans max-w-sm mx-auto mb-8 leading-relaxed">
          Flip a card and mark your first story to start building your
          collection.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full text-sm font-sans font-medium text-[#D462A6] border border-[#D462A6]/25 bg-[#D462A6]/[0.06] hover:bg-[#D462A6]/[0.12] hover:border-[#D462A6]/40 transition-colors duration-500"
        >
          Browse Stories
          <span className="text-[#D462A6]/60">→</span>
        </a>
      </motion.div>
    </div>
  );
}
