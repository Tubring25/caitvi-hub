import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface MeterBarProps {
  label: string;
  value: number;
  color: string;
  emoji: string;
}

export const MeterBar = ({ label, value, color, emoji}: MeterBarProps) => {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-sm w-5 text-center shrink-0">{emoji}</span>
      <span className="text-sm text-white/60 w-10 font-mono uppercase tracking-wider shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
        <motion.div
          initial={{ width: 0}}
          animate={{ width: `${(value / 5) * 100}%`}}
          transition={{ duration: 0.8, delay: 0.2}}
          className={cn("h-full rounded-full shadow-[0_0_8px_currentColor] relative z-10", color)}
        />
      </div>
    </div>
  )
}