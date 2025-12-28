import { Copy, ExternalLink, RotateCcw, BookMarked, BookOpen, CheckCircle, XCircle, Book} from "lucide-react";
import { motion } from "motion/react";
import { RATING_CONFIG, type Fic, type Rating, type ReadingStatus } from "@/types/fic";
import { cn } from "@/lib/utils";
import { AuthorRadar } from "./AuthorRadar";

interface FicCardBackProps {
  fic: Fic;
  onFlip: () => void;
  readingStatus: ReadingStatus;
  onStatusChange?: (status: ReadingStatus) => void;
}

const STATUS_OPTIONS: { key: ReadingStatus; icon: React.ReactNode; label: string}[] = [
  { key: "reading", icon: <BookOpen size={14} />, label: "Reading" },
  { key: "completed", icon: <CheckCircle size={14} />, label: "Completed" },
  { key: "dropped", icon: <XCircle size={14} />, label: "Dropped" }
]

export const FicCardBack = ({ fic, onFlip, readingStatus="none", onStatusChange }: FicCardBackProps) => {
  const handleCopyQuote = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(fic.quote)
  }

  const handleStatusClick = (e: React.MouseEvent, status: ReadingStatus) => {
    e.stopPropagation()
    onStatusChange?.(readingStatus === status ? "none" : status)
  }

  return (
    <div className="absolute inset-0 rounded-3xl overflow-hidden bg-background/60 backdrop-blur-xl border shadow-2xl flex flex-col p-5"
      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg) translateZ(0)"}}
    >
      {/* Author Radar Chart */}
      <AuthorRadar data={fic.authorStats} />

      {/* Quote */}
      <div className="flex-1 p-4 bg-linear-to-br from-accent/10 to-primary/5 rounded-xl border border-accent/20 relative flex items-center justify-center">
        <span className="absolute -top-2 left-4 text-4xl text-accent font-serif leading-none">&quot;</span>
        <p className="text-sm italic text-foreground/90 leading-relaxed text-center font-serif px-2">
          {fic.quote}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        <motion.button
          whileHover={{ scale: 1.05}}
          whileTap={{ scale: 0.95}}
          onClick={handleCopyQuote}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-accent  text-xs font-bold font-mono hover:bg-accent/10 transition-colors"
        >
          <Copy size={(12)} /> Copy
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-linear-to-r from-accent to-primary text-white text-xs font-bold font-mono"
        >
          <ExternalLink size={12} /> Read
        </motion.button>
      </div>

      {/* Reading Status */}
      <div className="flex gap-2 mt-3">
        {STATUS_OPTIONS.map((status) => (
          <motion.button
            key={status.key}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => handleStatusClick(e, status.key)}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border text-[10px] font-mono transition-all",
              readingStatus === status.key 
                ? "border-accent bg-accent/20 text-white" 
                : "border bg-white/5 text-white/60 hover:bg-white/10"
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
        className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-foreground/40 hover:text-white transition-colors"
      >
        <RotateCcw size={16} />
      </button>
    </div>
  )
}