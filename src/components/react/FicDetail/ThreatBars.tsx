import { motion, useReducedMotion } from "motion/react";
import type { FicState } from "@/types/fic";
import { useMemo } from "react";

interface ThreatBarsProps {
  state: FicState;
}

const DIMENSIONS: { key: keyof FicState; label: string; color: string }[] = [
  { key: "spice", label: "Spice", color: "#D52D00" },
  { key: "angst", label: "Angst", color: "#7b2ff7" },
  { key: "fluff", label: "Fluff", color: "#D462A6" },
  { key: "plot", label: "Plot", color: "#60a5fa" },
  { key: "romance", label: "Romance", color: "#EF7627" },
];

function getReaderFit(state: FicState): string {
  const entries = DIMENSIONS.map((d) => ({ label: d.label.toLowerCase(), value: state[d.key] }));
  const sorted = [...entries].sort((a, b) => b.value - a.value);
  const top1 = sorted[0];
  const top2 = sorted[1];
  const lowest = sorted[sorted.length - 1];
  if (top1.value === lowest.value) return "Balanced across all dimensions.";
  return `Best for: high ${top1.label} & ${top2.label}. Light on ${lowest.label}.`;
}

export default function ThreatBars({ state }: ThreatBarsProps) {
  const shouldReduceMotion = useReducedMotion();
  const readerFit = useMemo(() => getReaderFit(state), [state]);

  return (
    <div>
      <div className="flex flex-col gap-2.5">
        {DIMENSIONS.map((dim) => {
          const value = state[dim.key];
          const pct = (value / 5) * 100;
          return (
            <div key={dim.key} className="flex items-center gap-3">
              <span className="w-[70px] text-right text-[10px] font-mono uppercase text-white/45 tracking-wider shrink-0">
                {dim.label}
              </span>
              <div className="flex-1 h-2 bg-white/[0.04] rounded-sm overflow-hidden">
                <motion.div
                  className="h-full rounded-sm relative"
                  style={{ backgroundColor: dim.color }}
                  initial={{ width: shouldReduceMotion ? `${pct}%` : "0%" }}
                  animate={{ width: `${pct}%` }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }
                  }
                />
              </div>
              <span className="w-6 text-[11px] font-mono text-white/55">
                {value}/5
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] font-mono text-white/35 mt-3 italic">{readerFit}</p>
    </div>
  );
}
