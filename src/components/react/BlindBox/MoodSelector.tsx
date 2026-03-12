import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { BlindBoxMood } from ".";
import { cn } from "@/lib/utils";

const MOODS: {
  key: BlindBoxMood;
  img: string;
  label: string;
  color: string;
  glowColor: string;
}[] = [
  {
    key: "fluff",
    img: "/images/cupcake.png",
    label: "Like a cupcake",
    color: "#D462A6",
    glowColor: "rgba(212, 98, 166, 0.3)",
  },
  {
    key: "angst",
    img: "/images/2heads_dog.png",
    label: "Oil and Water",
    color: "#60a5fa",
    glowColor: "rgba(96, 165, 250, 0.3)",
  },
  {
    key: "spicy",
    img: "/images/blind_box_18.png",
    label: "Sorry to say,",
    color: "#D52D00",
    glowColor: "rgba(213, 45, 0, 0.3)",
  },
];

const EASING = [0.16, 1, 0.3, 1] as const;

const EXIT_DIRECTIONS = [-1, 0, 1] as const;

interface MoodSelectorProps {
  onSelect: (mood: BlindBoxMood) => void;
}

export function MoodSelector({ onSelect }: MoodSelectorProps) {
  const [chosen, setChosen] = useState<BlindBoxMood | null>(null);

  const handleClick = (mood: BlindBoxMood) => {
    setChosen(mood);
    setTimeout(() => onSelect(mood), 800);
  };

  const chosenIndex = chosen ? MOODS.findIndex((m) => m.key === chosen) : -1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5, ease: EASING }}
      className="py-6"
    >
      <h2 className="text-2xl font-serif font-bold text-foreground mb-1">
        Pick Your Poison
      </h2>
      <p className="text-white/40 text-xs font-sans uppercase tracking-[0.3em] mb-8">
        Select a flavor
      </p>

      <div className="grid grid-cols-3 gap-4">
        {MOODS.map((mood, i) => {
          const isChosen = chosen === mood.key;
          const isUnchosen = chosen !== null && !isChosen;
          const exitDir =
            isUnchosen && chosenIndex !== -1
              ? i < chosenIndex
                ? -1
                : 1
              : 0;

          return (
            <motion.button
              key={mood.key}
              initial={{ opacity: 0, y: 20 }}
              animate={
                isChosen
                  ? {
                      opacity: 1,
                      y: -8,
                      scale: 1.06,
                      rotate: 0,
                    }
                  : isUnchosen
                    ? {
                        opacity: 0,
                        y: 30,
                        scale: 0.8,
                        rotate: exitDir * 15,
                        x: exitDir * 40,
                      }
                    : {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        rotate: 0,
                        x: 0,
                      }
              }
              transition={{
                duration: isUnchosen ? 0.5 : 0.6,
                ease: EASING,
                delay: chosen ? 0 : i * 0.1,
              }}
              onClick={() => !chosen && handleClick(mood.key)}
              className={cn(
                "relative rounded-xl",
                "flex flex-col items-center justify-center gap-3",
                "p-4 group",
                chosen ? "cursor-default" : "cursor-pointer",
              )}
            >
              {/* Mood-colored aura behind the image — pulses on hover, bursts on select */}
              <motion.div
                className="absolute inset-0 rounded-xl"
                initial={{ opacity: 0 }}
                animate={
                  isChosen
                    ? { opacity: 1 }
                    : { opacity: 0 }
                }
                style={{
                  background: `radial-gradient(circle at 50% 40%, ${mood.glowColor}, transparent 70%)`,
                }}
                transition={{ duration: 0.4 }}
              />

              {/* Subtle resting border + hover tint */}
              <div
                className={cn(
                  "absolute inset-0 rounded-xl border transition-all duration-500",
                  isChosen
                    ? "border-[#D4AF37]/40"
                    : "border-white/[0.06] group-hover:border-white/15",
                  !chosen && "group-hover:bg-white/[0.03]",
                )}
              />

              {/* Gold seal ring on chosen */}
              <AnimatePresence>
                {isChosen && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: EASING, delay: 0.1 }}
                    className="absolute inset-0 rounded-xl border-2 border-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.2),inset_0_0_20px_rgba(212,175,55,0.05)]"
                  />
                )}
              </AnimatePresence>

              {/* Image with floating animation */}
              <div className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                <motion.div
                  animate={
                    !chosen
                      ? {
                          y: [0, -4, 0],
                        }
                      : {}
                  }
                  transition={{
                    duration: 2.5,
                    ease: "easeInOut",
                    repeat: Infinity,
                    delay: i * 0.4,
                  }}
                  className="w-full h-full"
                >
                  <img
                    src={mood.img}
                    alt={mood.label}
                    className={cn(
                      "w-full h-full object-contain transition-all duration-500 rounded-sm",
                      !chosen &&
                        "opacity-75 group-hover:opacity-100 group-hover:scale-110",
                      isChosen && "opacity-100",
                    )}
                  />
                </motion.div>
              </div>

              {/* Labels */}
              <div className="relative z-10 flex flex-col gap-0.5">
                <span
                  className={cn(
                    "text-[11px] font-semibold font-sans uppercase tracking-wider transition-colors duration-500",
                    isChosen
                      ? "text-[#D4AF37]/90"
                      : "text-foreground/70 group-hover:text-foreground/95",
                  )}
                >
                  {mood.key}
                </span>
                <span className="text-[10px] text-white/25 font-sans group-hover:text-white/40 transition-colors duration-500">
                  {mood.label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
