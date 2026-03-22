import { useState } from "react";
import { motion } from "motion/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Fic, Rating, ReadingStatus } from "@/types/fic";
import { cn } from "@/lib/utils";

/** Accent color by rating. */
const RATING_COLORS: Record<Rating, string> = {
  G: "#4ade80",
  T: "#60a5fa",
  M: "#facc15",
  E: "#ef4444",
};

/** Bottom marker color by reading status. */
const STATUS_COLORS: Record<ReadingStatus, string> = {
  none: "transparent",
  bookmarked: "#D4AF37",
  reading: "#60a5fa",
  completed: "#4ade80",
  dropped: "#ef4444",
};

/** Background gradient by fic category. */
const CATEGORY_GRADIENTS: Record<string, [string, string]> = {
  "Canon Compliant":    ["rgba(35,25,45,0.92)", "rgba(18,12,25,0.96)"],
  "Canon Divergence":   ["rgba(45,22,30,0.92)", "rgba(25,10,16,0.96)"],
  "Omegaverse":         ["rgba(50,20,20,0.92)", "rgba(28,10,10,0.96)"],
  "Modern AU":          ["rgba(25,35,45,0.92)", "rgba(12,18,28,0.96)"],
  "Historical AU":      ["rgba(45,35,20,0.92)", "rgba(25,18,10,0.96)"],
  "Sci-Fi AU":          ["rgba(20,35,40,0.92)", "rgba(10,20,25,0.96)"],
  "Political Intrigue": ["rgba(35,28,38,0.92)", "rgba(20,14,22,0.96)"],
  "Fluff":              ["rgba(40,30,35,0.92)", "rgba(22,16,20,0.96)"],
};

const DEFAULT_GRADIENT: [string, string] = ["rgba(50,30,38,0.9)", "rgba(25,12,18,0.95)"];

function getSpineGradient(category: string): string {
  const [from, to] = CATEGORY_GRADIENTS[category] ?? DEFAULT_GRADIENT;
  return `linear-gradient(160deg, ${from} 0%, ${to} 100%)`;
}

/** Scale word count into a shelf-friendly height. */
export function getSpineHeight(words: number): number {
  const min = 100;
  const max = 220;
  const clamped = Math.max(5000, Math.min(words, 150000));
  return Math.round(min + ((clamped - 5000) / (150000 - 5000)) * (max - min));
}

/** Scale chapter count into a shelf-friendly width. */
export function getSpineWidth(chapters: number): number {
  const min = 36;
  const max = 64;
  const clamped = Math.max(1, Math.min(chapters, 35));
  return Math.round(min + ((clamped - 1) / (35 - 1)) * (max - min));
}

export { RATING_COLORS, STATUS_COLORS, getSpineGradient };

interface BookSpineProps {
  fic: Fic;
  status: ReadingStatus;
  isSelected: boolean;
  onSelect: (fic: Fic) => void;
}

export function BookSpine({ fic, status, isSelected, onSelect }: BookSpineProps) {
  const height = getSpineHeight(fic.stats.words);
  const width = getSpineWidth(fic.stats.chapters);
  const ratingColor = RATING_COLORS[fic.rating];
  const statusColor = STATUS_COLORS[status];
  const spineGradient = getSpineGradient(fic.category);
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fic.id });

  const sortableStyle: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
    opacity: isDragging ? 0.7 : undefined,
  };

  if (isSelected) {
    return (
      <div
        ref={setNodeRef}
        style={sortableStyle}
        className="flex-shrink-0 rounded-sm border border-dashed border-white/[0.06]"
        {...attributes}
      >
        <div style={{ width, height }} />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={sortableStyle}
      className="relative flex-shrink-0"
      {...attributes}
    >
      {/* Hover label */}
      <div
        className={cn(
          "absolute -top-8 left-1/2 -translate-x-1/2 z-20",
          "px-2.5 py-1 rounded bg-[rgba(10,6,8,0.9)] border border-white/[0.1]",
          "text-[10px] font-sans text-white/80 whitespace-nowrap",
          "pointer-events-none transition-opacity duration-300",
          isHovered && !isDragging ? "opacity-100" : "opacity-0",
        )}
      >
        {fic.title}
      </div>

      <motion.button
        layoutId={isDragging ? undefined : `book-${fic.id}`}
        onClick={() => onSelect(fic)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative group",
          "rounded-sm overflow-hidden cursor-pointer",
          "border border-white/[0.1]",
          "hover:border-white/20",
          "transition-colors duration-500",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D462A6]",
          isDragging && "scale-105 shadow-lg shadow-black/40",
        )}
        style={{ width, height, background: spineGradient }}
        aria-label={`${fic.title} by ${fic.author} — ${status}`}
        {...listeners}
      >
        {/* Top accent */}
        <div
          className="absolute top-0 inset-x-0 h-[3px]"
          style={{ backgroundColor: ratingColor, opacity: 0.8 }}
        />

        {/* Left edge highlight */}
        <div
          className="absolute top-0 left-0 bottom-0 w-[3px]"
          style={{ background: `linear-gradient(to right, ${ratingColor}15, transparent)` }}
        />

        {/* Spine title */}
        <div className="absolute inset-0 flex items-center justify-center px-1 py-3">
          <span
            className="text-[10px] font-sans font-medium text-white/60 group-hover:text-white/90 transition-colors duration-500 leading-tight text-center"
            style={{
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {fic.title}
          </span>
        </div>

        {/* Bottom status marker */}
        <div
          className="absolute bottom-0 inset-x-0 h-[2px] transition-opacity duration-500"
          style={{ backgroundColor: statusColor, opacity: 0.6 }}
        />

        {/* Hover glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${ratingColor}08 0%, transparent 70%)`,
          }}
        />
      </motion.button>
    </div>
  );
}
