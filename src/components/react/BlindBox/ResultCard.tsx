import { useMemo } from "react";
import { motion } from "motion/react";
import { ExternalLink, RotateCcw, Shuffle } from "lucide-react";
import type { Fic } from "@/types/fic";

const ERROR_MESSAGES = [
  "Hextech malfunction... The Undercity swallowed your fic.",
  "Even Vi's gauntlets couldn't punch through this one.",
  "The Hexgates are down. No fics getting through.",
  "Jinx got to the server first. Boom.",
];

const EASING = [0.16, 1, 0.3, 1] as const;

interface ResultCardProps {
  fic: Fic | null;
  mood?: string | null;
  onRetry: () => void;
  onQuickRetry?: () => void;
  onClose: () => void;
}

export const ResultCard = ({ fic, mood, onRetry, onQuickRetry }: ResultCardProps) => {
  const errorMessage = useMemo(
    () => ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)],
    [],
  );

  if (!fic) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: EASING }}
        className="text-center py-8"
      >
        <p className="text-white/30 text-xs uppercase tracking-[0.3em] font-sans mb-3">
          Something went wrong
        </p>
        <h3 className="text-lg font-serif italic text-white/70 mb-6 px-2">
          {errorMessage}
        </h3>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.2em] font-sans font-medium text-white/60 border border-white/15 rounded-lg hover:text-white/90 hover:border-white/30 transition-colors duration-400"
        >
          <RotateCcw className="size-3.5" />
          Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASING }}
      className="py-4"
    >
      {/* Kicker */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-[#D4AF37]/60 text-[10px] uppercase tracking-[0.4em] font-sans font-medium mb-3"
      >
        Your pick
      </motion.p>

      {/* Title & Author */}
      <h3 className="text-xl font-serif font-bold text-white mb-1 line-clamp-2 leading-snug">
        {fic.title}
      </h3>
      <p className="text-[#D462A6]/70 text-sm font-sans mb-4">
        by {fic.author}
      </p>

      {/* Summary */}
      <p className="text-white/50 text-sm leading-relaxed line-clamp-5 mb-6 font-sans">
        {fic.summary}
      </p>

      {/* Divider */}
      <div className="w-full h-px bg-white/10 mb-5" />

      {/* Actions */}
      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] font-sans font-medium text-white/50 border border-white/10 rounded-lg hover:text-white/80 hover:border-white/25 transition-colors duration-400"
        >
          <Shuffle className="size-3" />
          换个口味
        </button>
        {onQuickRetry && mood && (
          <button
            onClick={onQuickRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] font-sans font-medium text-white/50 border border-white/10 rounded-lg hover:text-white/80 hover:border-white/25 transition-colors duration-400"
          >
            <RotateCcw className="size-3" />
            再来一次
          </button>
        )}
        <a
          href={fic.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] font-sans font-medium text-[#D462A6]/80 border border-[#D462A6]/20 rounded-lg hover:text-[#D462A6] hover:border-[#D462A6]/40 transition-colors duration-400 ml-auto"
        >
          <ExternalLink className="size-3" />
          去看看
        </a>
      </div>
    </motion.div>
  );
};
