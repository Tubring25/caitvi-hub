import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface MeterBarProps {
  label: string;
  value: number;
  color: string;
}

export const MeterBar = ({ label, value, color }: MeterBarProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-white/50 w-10 font-mono uppercase tracking-wider shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / 5) * 100}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={cn("h-full rounded-full shadow-[0_0_6px_currentColor]", color)}
        />
      </div>
    </div>
  );
};
