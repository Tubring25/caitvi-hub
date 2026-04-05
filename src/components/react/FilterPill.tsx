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
        "flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold tracking-wider uppercase border transition-all duration-200 shrink-0",
        active
          ? "bg-[var(--lesbian-pink)]/15 border-[var(--lesbian-pink)]/60 text-white shadow-sm"
          : "bg-white/5 border-white/10 text-white/50 hover:border-white/20 hover:text-white/70",
        active && activeClassName,
      )}
    >
      {children}
    </motion.button>
  );
}
