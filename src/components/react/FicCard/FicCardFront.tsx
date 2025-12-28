import React from "react";
import { BookOpen, ExternalLink, Heart, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { MeterBar } from "./MeterBar";
import { RATING_CONFIG, type Fic, type Rating } from "@/types/fic";

interface FicCardFrontProps {
  fic: Fic;
  onFlip: () => void;
  isHovered: boolean;
}

export const FicCardFront = ({ fic, onFlip, isHovered }: FicCardFrontProps) => {

  const getRatingBadge = (rating: Rating) => {
    const styles = {
      E: "bg-red-500/20 text-red-400 border-red-500/30",
      M: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      T: "bg-blue-400/20 text-blue-400 border-blue-400/30",
      G: "bg-green-400/20 text-green-400 border-green-400/30",
      default: "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
    return styles[rating] || styles.default;
  }

  return (
    <div 
      className="absolute inset-0 rounded-3xl overflow-hidden bg-black/50 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col p-5"
      style={{ backfaceVisibility: "hidden", transform: "translateZ(0)" }}
    >

      {/* Header Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={cn('px-2 py-0.5 rounded border text-[10px] font-bold font-mono', getRatingBadge(fic.rating))}>
          {RATING_CONFIG[fic.rating].label}
        </span>
        <span className="px-2 py-0.5 rounded border border-white/10 bg-white/5 text-white/70 text-[10px] font-bold truncate max-w-[120px]">
          {fic.category.toUpperCase()}
        </span>
        {fic.isTranslated && (
          <span className="px-2 py-0.5 rounded border border-orange-500/30 bg-orange-500/10 text-orange-400 text-[10px] font-bold">
            CN
          </span>
        )}
      </div>

      {/* Title & Author */}
      <div className="mb-3">
        <h3 className="text-xl font-bold text-white font-serif leading-tight mb-1 line-clamp-2">
          {fic.title}
        </h3>
        <p className="text-xs text-accent font-mono opacity-80">by {fic.author}</p>
      </div>

      {/* Summary */}
      <p className="text-sm text-gray-300 line-clamp-3 mb-4 leading-relaxed font-light flex-1">
        {fic.summary}
      </p>

      <a href={fic.originLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-center gap-2 mb-4 py-2 rounded-lg border border-accent/30 bg-accent/5 text-accent text-xs font-mono font-semibold hover:bg-accent/15 hover:border-accent/50 transition-all group"
      >
        <ExternalLink size={12} className="group-hover:translate-x-0.5 transition-transform" />
        Read on AO3
      </a>

      {/* Meter Bars */}
      <div className="mb-4 space-y-2">
        <MeterBar label="SPICE" value={fic.state.spice} color="bg-red-500" emoji="🔥" />
        <MeterBar label="ANGST" value={fic.state.angst} color="bg-blue-500" emoji="🌧️" />
        <MeterBar label="FLUFF" value={fic.state.fluff} color="bg-green-500" emoji="🍰" />
      </div>

      {/* Footer & Statistics */}
      <div className="pt-3 border-t border-white/10 flex justify-between items-center text-xs text-gray-500 font-mono mt-auto">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5"><BookOpen size={12} /> {Math.round(fic.stats.words / 1000)}k</span>
          <span className="flex items-center gap-1.5"><Heart size={12} className="text-red-500/60" /> {fic.stats.kudos}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onFlip(); }}
          className="flex items-center gap-1 text-pink-400/60 hover:text-pink-400 transition-colors uppercase tracking-wider font-bold text-[10px]"
        >
          Flip <RotateCw size={10} />
        </button>
      </div>
    </div>
  )
}