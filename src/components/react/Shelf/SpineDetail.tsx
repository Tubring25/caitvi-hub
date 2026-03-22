import { motion } from "motion/react";
import { ExternalLink, X, Bookmark, BookOpen, CheckCircle, XCircle } from "lucide-react";
import type { Fic, ReadingStatus } from "@/types/fic";
import { RATING_CONFIG } from "@/types/fic";
import { RATING_COLORS } from "./BookSpine";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const STATUS_OPTIONS: { key: ReadingStatus; icon: React.ReactNode; label: string }[] = [
  { key: "bookmarked", icon: <Bookmark size={14} />, label: "To Read" },
  { key: "reading", icon: <BookOpen size={14} />, label: "Reading" },
  { key: "completed", icon: <CheckCircle size={14} />, label: "Completed" },
  { key: "dropped", icon: <XCircle size={14} />, label: "Dropped" },
];

interface SpineDetailProps {
  fic: Fic;
  currentStatus: ReadingStatus;
  onStatusChange: (ficId: string, status: ReadingStatus) => void;
  onClose: () => void;
}

export function SpineDetail({ fic, currentStatus, onStatusChange, onClose }: SpineDetailProps) {
  const ratingConfig = RATING_CONFIG[fic.rating];
  const ratingColor = RATING_COLORS[fic.rating];

  const handleStatusClick = (status: ReadingStatus) => {
    onStatusChange(fic.id, currentStatus === status ? "none" : status);
  };

  const formatNumber = (n: number): string => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-40"
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center px-5 pointer-events-none">
        <motion.div
          layoutId={`book-${fic.id}`}
          className="w-full max-w-sm rounded-xl overflow-hidden border border-white/[0.1] p-5 sm:p-6 pointer-events-auto"
          style={{
            background: `linear-gradient(160deg, rgba(50,30,38,0.95) 0%, rgba(25,12,18,0.98) 100%)`,
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl"
            style={{ backgroundColor: ratingColor, opacity: 0.8 }}
          />

          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="min-w-0">
              <motion.h3
                layout="position"
                className="text-lg font-serif font-semibold text-white truncate"
              >
                {fic.title}
              </motion.h3>
              <p className="text-sm text-white/50 font-sans mt-0.5">
                by {fic.author}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close detail"
              className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors duration-300 flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="flex flex-wrap items-center gap-3 mb-4 text-xs font-sans"
          >
            <span className={cn("px-2 py-0.5 rounded font-mono font-medium text-white", ratingConfig.color)}>
              {ratingConfig.label}
            </span>
            <span className="text-white/40">
              {formatNumber(fic.stats.words)} words
            </span>
            <span className="text-white/40">
              {fic.stats.chapters} ch
            </span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider",
              fic.status === "completed" ? "bg-white/[0.06] text-white/50" : "bg-[#60a5fa]/10 text-[#60a5fa]/70"
            )}>
              {fic.status}
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-sm text-white/50 leading-relaxed mb-5 line-clamp-3"
          >
            {fic.summary}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="flex gap-2 mb-4"
          >
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleStatusClick(opt.key)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-sans transition-all duration-300",
                  currentStatus === opt.key
                    ? "border-[#D462A6] bg-[#D462A6]/15 text-white"
                    : "border-white/[0.06] bg-white/[0.03] text-white/50 hover:bg-white/[0.06]",
                )}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </motion.div>

          <motion.a
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            href={fic.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-gradient-to-r from-[#D462A6] to-[#A30262] text-white text-xs font-sans font-semibold"
          >
            <ExternalLink size={12} />
            Read on AO3
            <span className="sr-only"> (opens in new tab)</span>
          </motion.a>
        </motion.div>
      </div>
    </>
  );
}
