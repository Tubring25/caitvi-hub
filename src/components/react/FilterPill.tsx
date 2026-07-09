import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface FilterPillProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  activeClassName?: string;
}

export default function FilterPill({ active, onClick, children, activeClassName }: FilterPillProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex min-h-[44px] shrink-0 items-center gap-2 rounded-[4px] border px-3.5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] transition-all duration-200",
        active
          ? "border-[var(--lesbian-pink)]/60 bg-[var(--lesbian-pink)]/15 text-white"
          : "border-white/[0.1] bg-black/15 text-white/55 hover:border-white/20 hover:bg-white/[0.04] hover:text-white/80",
        active && activeClassName,
      )}
    >
      {children}
    </motion.button>
  );
}
