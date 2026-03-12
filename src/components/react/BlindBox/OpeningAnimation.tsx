import { useMemo } from "react";
import { motion } from "motion/react";
import type { BlindBoxMood } from "./index";

const MOOD_QUOTES: Record<string, string[]> = {
  fluff: ["Like a cupcake...", "Promise me you won't change...", "What about us?..."],
  angst: ["Oil and water...", "It's been real, cupcake...", "What are we now?..."],
  spicy: ["You've grown a bit predictable...", "You're hot, cupcake...", "Easy, easy, easy..."],
};

const MOOD_GLOW: Record<string, string> = {
  fluff: "rgba(212, 98, 166, 0.12)",
  angst: "rgba(96, 165, 250, 0.12)",
  spicy: "rgba(213, 45, 0, 0.12)",
};

const EASING = [0.16, 1, 0.3, 1] as const;
const PARTICLE_COUNT = 8;

interface OpeningAnimationProps {
  mood: BlindBoxMood;
}

export const OpeningAnimation = ({ mood }: OpeningAnimationProps) => {
  const quote = useMemo(() => {
    const quotes = MOOD_QUOTES[mood] ?? MOOD_QUOTES.angst;
    return quotes[Math.floor(Math.random() * quotes.length)];
  }, [mood]);

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        angle: (360 / PARTICLE_COUNT) * i,
        size: 2 + Math.random() * 2,
        orbitRadius: 52 + Math.random() * 12,
        delay: i * 0.15,
      })),
    [],
  );

  const moodGlow = MOOD_GLOW[mood] ?? MOOD_GLOW.angst;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative flex flex-col items-center justify-center py-14 overflow-hidden"
    >
      {/* Radial mood-tinted pulse behind everything */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${moodGlow}, transparent 70%)`,
        }}
      />

      {/* Orbiting gold particles */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-[#D4AF37]"
            style={{
              width: p.size,
              height: p.size,
              top: "50%",
              left: "50%",
              marginTop: -p.size / 2,
              marginLeft: -p.size / 2,
            }}
            initial={{
              x: Math.cos((p.angle * Math.PI) / 180) * p.orbitRadius,
              y: Math.sin((p.angle * Math.PI) / 180) * p.orbitRadius,
              opacity: 0,
            }}
            animate={{
              x: [
                Math.cos((p.angle * Math.PI) / 180) * p.orbitRadius,
                Math.cos(((p.angle + 360) * Math.PI) / 180) * p.orbitRadius,
              ],
              y: [
                Math.sin((p.angle * Math.PI) / 180) * p.orbitRadius,
                Math.sin(((p.angle + 360) * Math.PI) / 180) * p.orbitRadius,
              ],
              opacity: [0, 0.8, 0.3, 0.8, 0],
            }}
            transition={{
              duration: 3,
              ease: "linear",
              repeat: Infinity,
              delay: p.delay,
            }}
          />
        ))}

        {/* Central seal — coin with crest */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{
            scale: [0.6, 1, 1],
            opacity: [0, 1, 1],
            rotateY: [0, 360],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2.5,
            ease: EASING,
          }}
          className="relative w-24 h-24"
        >
          <div
            className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/80 bg-[#1e0f14] shadow-[0_0_20px_rgba(212,175,55,0.25),0_0_60px_rgba(163,2,98,0.1)] flex items-center justify-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="absolute inset-[3px] rounded-full border border-[#D4AF37]/25" />
            <img
              src="/images/kiramman_crest.png"
              alt="Kiramman Crest"
              className="w-3/5 h-3/5 object-contain opacity-80"
            />
          </div>
        </motion.div>
      </div>

      {/* Quote — staggered character reveal */}
      <div className="mt-8 font-serif italic text-sm text-white/60 flex flex-wrap justify-center">
        {quote.split("").map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: char === " " ? 1 : [0, 0.8, 0.5] }}
            transition={{
              duration: 1.2,
              ease: "easeOut",
              delay: 0.6 + i * 0.04,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
};
