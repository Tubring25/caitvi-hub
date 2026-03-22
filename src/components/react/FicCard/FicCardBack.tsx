import { Copy, ExternalLink, RotateCcw, Bookmark, BookOpen, CheckCircle, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { type Fic, type ReadingStatus } from "@/types/fic";
import { cn } from "@/lib/utils";
import { FicRadar } from "./AuthorRadar";

interface FicCardBackProps {
  fic: Fic;
  onFlip: () => void;
  readingStatus: ReadingStatus;
  onStatusChange?: (status: ReadingStatus) => void;
}

const STATUS_OPTIONS: { key: ReadingStatus; icon: React.ReactNode; label: string }[] = [
  { key: "bookmarked", icon: <Bookmark size={14} />, label: "To Read" },
  { key: "reading", icon: <BookOpen size={14} />, label: "Reading" },
  { key: "completed", icon: <CheckCircle size={14} />, label: "Completed" },
  { key: "dropped", icon: <XCircle size={14} />, label: "Dropped" },
];

export const FicCardBack = ({ fic, onFlip, readingStatus = "none", onStatusChange }: FicCardBackProps) => {
  const handleCopyQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(fic.quote);
  };

  const handleStatusClick = (e: React.MouseEvent, status: ReadingStatus) => {
    e.stopPropagation();
    onStatusChange?.(readingStatus === status ? "none" : status);
  };

  return (
    <div
      className="absolute inset-0 rounded-2xl overflow-hidden bg-[#1e0f14]/70 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col p-5"
      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg) translateZ(0)" }}
    >
      {/* Fic Radar Chart */}
      <FicRadar data={fic.state} />

      {/* Quote */}
      {fic.quote && (
        <div className="flex-1 p-4 bg-gradient-to-br from-[#D462A6]/[0.08] to-[#A30262]/[0.04] rounded-xl border border-[#D462A6]/15 relative flex items-center justify-center">
          <span className="absolute -top-2 left-4 text-4xl text-[#D462A6]/50 font-serif leading-none">&quot;</span>
          <p className="text-sm italic text-foreground/90 leading-relaxed text-center font-serif px-2">
            {fic.quote}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        {fic.quote && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCopyQuote}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#D462A6]/25 text-xs font-bold text-white/70 hover:bg-[#D462A6]/10 transition-colors duration-300"
          >
            <Copy size={12} /> Copy
          </motion.button>
        )}
        <motion.a
          href={fic.link}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-[#D462A6] to-[#A30262] text-white text-xs font-bold"
        >
          <ExternalLink size={12} /> Read
        </motion.a>
      </div>

      {/* Reading Status */}
      <div className="flex gap-2 mt-3">
        {STATUS_OPTIONS.map((status) => (
          <motion.button
            key={status.key}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={(e) => handleStatusClick(e, status.key)}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border text-[10px] transition-all duration-300",
              readingStatus === status.key
                ? "border-[#D462A6] bg-[#D462A6]/15 text-white"
                : "border-white/[0.06] bg-white/[0.03] text-white/50 hover:bg-white/[0.06]",
            )}
          >
            {status.icon}
            <span>{status.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Flip Back Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onFlip(); }}
        aria-label="Flip card back"
        className="absolute top-4 right-4 p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-foreground/50 hover:text-white transition-colors duration-300"
      >
        <RotateCcw size={16} />
      </button>
    </div>
  );
};
