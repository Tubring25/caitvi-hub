import React from "react";
import { Bookmark, BookmarkCheck, BookOpen, ExternalLink, Heart, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { MeterBar } from "./MeterBar";
import { RATING_CONFIG, type Fic, type Rating, type ReadingStatus } from "@/types/fic";

interface FicCardFrontProps {
  fic: Fic;
  onFlip: () => void;
  isHovered: boolean;
  readingStatus?: ReadingStatus;
  onStatusChange?: (status: ReadingStatus) => void;
}

export const FicCardFront = ({ fic, onFlip, isHovered, readingStatus = "none", onStatusChange }: FicCardFrontProps) => {
  const summary = fic.summary.replace(/\\n/g, "\n").trim();
  const isBookmarked = readingStatus === "bookmarked";

  const getRatingBadge = (rating: Rating) => {
    const styles = {
      E: "bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30",
      M: "bg-[#facc15]/20 text-[#facc15] border-[#facc15]/30",
      T: "bg-[#60a5fa]/20 text-[#60a5fa] border-[#60a5fa]/30",
      G: "bg-[#4ade80]/20 text-[#4ade80] border-[#4ade80]/30",
      default: "bg-white/10 text-white/50 border-white/20"
    };
    return styles[rating] || styles.default;
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStatusChange?.(isBookmarked ? "none" : "bookmarked");
  };

  return (
    <div 
      className="absolute inset-0 rounded-2xl overflow-hidden bg-[#1e0f14]/70 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col p-5"
      style={{ backfaceVisibility: "hidden", transform: "translateZ(0)" }}
    >
      {/* Header: Tags + Bookmark */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex min-h-6 items-center gap-2 flex-wrap flex-1">
          <span className={cn('px-2 py-0.5 rounded border text-[10px] font-bold font-mono', getRatingBadge(fic.rating))}>
            {RATING_CONFIG[fic.rating].label}
          </span>
          <span className={cn(
            "px-2 py-0.5 rounded border text-[10px] font-bold font-mono",
            fic.status === "completed"
              ? "border-[#4ade80]/25 bg-[#4ade80]/10 text-[#4ade80]/80"
              : "border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#D4AF37]/80"
          )}>
            {fic.status === "completed" ? "Complete" : "Ongoing"}
          </span>
          <span className="text-[10px] font-mono text-white/35">
            {fic.stats.chapters} ch
          </span>
        </div>

        {/* Bookmark button */}
        <button
          onClick={handleBookmark}
          aria-label={isBookmarked ? "Remove bookmark" : "Bookmark for later"}
          className="p-1.5 -mr-1 flex-shrink-0 transition-colors duration-300"
        >
          {isBookmarked ? (
            <BookmarkCheck size={16} className="text-[#D4AF37] fill-[#D4AF37]" />
          ) : (
            <Bookmark size={16} className="text-white/25 hover:text-white/50" />
          )}
        </button>
      </div>

      {/* Title & Author */}
      <div className="mb-3">
        <a 
          href={fic.link} 
          target="_blank" 
          rel="noopener noreferrer" 
          onClick={(e) => e.stopPropagation()}
          className="group/title inline"
        >
          <h3 className="text-lg font-bold text-white font-serif leading-tight mb-1 line-clamp-2 group-hover/title:text-[#D462A6]/90 transition-colors duration-300">
            {fic.title}
            <ExternalLink size={11} className="inline-block ml-1.5 opacity-0 group-hover/title:opacity-60 transition-opacity duration-300 align-baseline" />
          </h3>
        </a>
        <p className="text-xs text-[#D462A6]/70">by {fic.author}</p>
      </div>

      {/* Summary */}
      <p className="overflow-hidden text-sm leading-relaxed text-white/50 line-clamp-5">
        {summary}
      </p>

      {/* Divider */}
      <div className="w-full h-px bg-white/[0.06] mt-auto mb-3" />

      {/* Meter Bars */}
      <div className="mb-4 space-y-2">
        <MeterBar label="SPICE" value={fic.state.spice} color="bg-[#D52D00]" />
        <MeterBar label="ANGST" value={fic.state.angst} color="bg-[#7c9ab5]" />
        <MeterBar label="FLUFF" value={fic.state.fluff} color="bg-[#D462A6]" />
      </div>

      {/* Footer & Statistics */}
      <div className="pt-3 border-t border-white/[0.06] flex justify-between items-center text-[11px] text-white/50 font-mono">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5"><BookOpen size={12} /> {Math.round(fic.stats.words / 1000)}k</span>
          <span className="flex items-center gap-1.5"><Heart size={12} className="text-[#D462A6]/50" /> {fic.stats.kudos}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onFlip(); }}
          aria-label={`Flip card for ${fic.title}`}
          className="flex items-center gap-1 text-[#D462A6]/60 hover:text-[#D462A6] transition-colors duration-300 uppercase tracking-wider font-bold text-[10px] py-2 px-2 -mr-2 -mb-2"
        >
          Flip <RotateCw size={10} />
        </button>
      </div>
    </div>
  );
}
