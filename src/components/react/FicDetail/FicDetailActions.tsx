import { motion, AnimatePresence } from "motion/react";
import { useReadingStatus } from "@/hooks/use-reading-status";
import { cn } from "@/lib/utils";
import type { ReadingStatus } from "@/types/fic";

interface FicDetailActionsProps {
  ficId: string;
}

const INACTIVE = {
  color: "rgba(255,255,255,0.3)",
  background: "rgba(255,255,255,0.02)",
  borderColor: "rgba(255,255,255,0.06)",
};

const STATUS_OPTIONS: {
  key: ReadingStatus;
  label: string;
  activeLabel: string;
  active: { color: string; background: string; borderColor: string };
  iconBg: string;
  icon: string;
}[] = [
  {
    key: "bookmarked",
    label: "To Read",
    activeLabel: "Queued",
    active: { color: "#D4AF37", background: "rgba(212,175,55,0.1)", borderColor: "rgba(212,175,55,0.3)" },
    iconBg: "rgba(212,175,55,0.13)",
    icon: "◆",
  },
  {
    key: "reading",
    label: "Reading",
    activeLabel: "In Progress",
    active: { color: "#D462A6", background: "rgba(212,98,166,0.1)", borderColor: "rgba(212,98,166,0.3)" },
    iconBg: "rgba(212,98,166,0.13)",
    icon: "▶",
  },
  {
    key: "completed",
    label: "Done",
    activeLabel: "Complete",
    active: { color: "#4ade80", background: "rgba(74,222,128,0.1)", borderColor: "rgba(74,222,128,0.3)" },
    iconBg: "rgba(74,222,128,0.13)",
    icon: "✓",
  },
  {
    key: "dropped",
    label: "Drop",
    activeLabel: "Dropped",
    active: { color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.12)" },
    iconBg: "rgba(255,255,255,0.06)",
    icon: "✕",
  },
];

const spring = { type: "spring" as const, stiffness: 500, damping: 35, mass: 0.8 };

export default function FicDetailActions({ ficId }: FicDetailActionsProps) {
  const { getStatus, updateStatus } = useReadingStatus();
  const status = getStatus(ficId);

  const handleClick = (key: ReadingStatus) => {
    updateStatus(ficId, status === key ? "none" : key);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_OPTIONS.map((opt) => {
        const isActive = status === opt.key;
        const colors = isActive ? opt.active : INACTIVE;

        return (
          <motion.button
            key={opt.key}
            onClick={() => handleClick(opt.key)}
            animate={{
              ...colors,
              scale: 1,
            }}
            whileHover={!isActive ? {
              color: "rgba(255,255,255,0.5)",
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.1)",
            } : undefined}
            whileTap={{ scale: 0.96 }}
            transition={spring}
            className={cn(
              "relative flex items-center gap-2 px-3.5 py-2 rounded",
              "font-mono text-[11px] uppercase tracking-[0.12em]",
              "border cursor-pointer select-none outline-none",
            )}
          >
            <motion.span
              className="inline-flex items-center justify-center w-4 h-4 rounded-sm text-[9px] font-bold leading-none"
              animate={{ backgroundColor: isActive ? opt.iconBg : "rgba(255,255,255,0.04)" }}
              transition={spring}
            >
              {opt.icon}
            </motion.span>

            {/* Fixed-width label region to prevent layout shift */}
            <span className="relative inline-grid overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={isActive ? "active" : "idle"}
                  initial={{ y: 6, opacity: 0, filter: "blur(2px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: -6, opacity: 0, filter: "blur(2px)" }}
                  transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="col-start-1 row-start-1 whitespace-nowrap"
                >
                  {isActive ? opt.activeLabel : opt.label}
                </motion.span>
              </AnimatePresence>
            </span>

            {/* Active pip — absolute so it doesn't shift layout */}
            <AnimatePresence>
              {isActive && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.7 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-current"
                />
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
