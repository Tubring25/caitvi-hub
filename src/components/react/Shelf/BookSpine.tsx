import { motion } from "motion/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Fic, Rating, ReadingStatus } from "@/types/fic";
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

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

const BOOK_COVERS = [
  "#6B2142",
  "#2D5A47",
  "#8B4513",
  "#3D6B4F",
  "#4A3570",
  "#832020",
  "#2B3A5C",
  "#3C3C50",
  "#705030",
  "#1A4A4A",
  "#502850",
  "#6E2F2F",
];

const STATUS_LABELS: Record<ReadingStatus, string> = {
  none: "Unsorted",
  bookmarked: "To Read",
  reading: "Reading",
  completed: "Completed",
  dropped: "Dropped",
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getBookCover(fic: Fic): string {
  return BOOK_COVERS[hashString(`${fic.id}-${fic.title}`) % BOOK_COVERS.length];
}

function getSpineGradient(category: string): string {
  return BOOK_COVERS[hashString(category) % BOOK_COVERS.length];
}

function normalizeWordCount(words: number): number {
  const min = 5000;
  const max = 200000;
  const clamped = Math.max(min, Math.min(words, max));
  return (Math.log(clamped) - Math.log(min)) / (Math.log(max) - Math.log(min));
}

function getSpineTitle(title: string): string {
  const trimmed = title.trim();
  const maxLength = 40;
  if (trimmed.length <= maxLength) return trimmed;

  const withoutParenthetical = trimmed.replace(/\s*\([^)]*\)\s*$/, "").trim();
  if (withoutParenthetical.length >= 12 && withoutParenthetical.length <= maxLength) {
    return withoutParenthetical;
  }

  const firstSegment = trimmed.split(/[:;,.!?]/)[0]?.trim();
  if (firstSegment && firstSegment.length >= 12 && firstSegment.length <= maxLength) {
    return firstSegment;
  }

  const clipped = trimmed.slice(0, maxLength).trimEnd();
  const wholeWords = clipped.replace(/\s+\S*$/, "").trim();
  return wholeWords.length >= 12 ? wholeWords : clipped;
}

function getSpineTitleFontSize(title: string, width: number): number {
  if (title.length > 34 || width < 40) return 10;
  if (title.length > 24) return 11;
  return 12;
}

/** Give each book a stable shelf height without turning the shelf into a chart. */
export function getSpineHeight(words: number, seed = ""): number {
  const min = 132;
  const max = 220;
  const wordWeight = normalizeWordCount(words);
  const seedWeight = seed ? (hashString(seed) % 100) / 100 : wordWeight;
  const visualWeight = seedWeight * 0.7 + wordWeight * 0.3;
  return Math.round(min + visualWeight * (max - min));
}

/** Use word count as the book thickness proxy. */
export function getSpineWidth(words: number): number {
  const min = 34;
  const max = 64;
  return Math.round(min + normalizeWordCount(words) * (max - min));
}

export { RATING_COLORS, STATUS_COLORS, getSpineGradient };

interface BookSpineProps {
  fic: Fic;
  status: ReadingStatus;
  isSelected: boolean;
  onSelect: (fic: Fic) => void;
}

export function BookSpine({ fic, status, isSelected, onSelect }: BookSpineProps) {
  const height = getSpineHeight(fic.stats.words, fic.id);
  const width = getSpineWidth(fic.stats.words);
  const ratingColor = RATING_COLORS[fic.rating];
  const statusColor = STATUS_COLORS[status];
  const coverColor = getBookCover(fic);
  const spineTitle = getSpineTitle(fic.title);
  const spineTitleFontSize = getSpineTitleFontSize(spineTitle, width);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fic.id });

  const sortableStyle: CSSProperties = {
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
        className="flex-shrink-0 rounded-[2px_4px_4px_2px] border border-dashed border-white/[0.08]"
      >
        <div style={{ width, height }} />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={sortableStyle}
      className="group relative flex-shrink-0"
    >
      <div
        className={cn(
          "pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-30 w-max max-w-[220px] -translate-x-1/2 rounded-[3px] border border-white/[0.1] bg-[rgba(18,11,15,0.96)] px-2.5 py-1.5 text-center font-sans text-[10px] leading-snug text-white/78 opacity-0 shadow-[0_8px_22px_rgba(0,0,0,0.38)] transition-opacity duration-200",
          !isDragging && "group-hover:opacity-100 group-focus-within:opacity-100",
        )}
      >
        {fic.title}
      </div>
      <motion.button
        layoutId={isDragging ? undefined : `book-${fic.id}`}
        onClick={() => onSelect(fic)}
        whileHover={{ y: -12, rotate: -2 }}
        whileTap={{ y: -4, scale: 0.98 }}
        className={cn(
          "relative group",
          "overflow-hidden cursor-pointer",
          "rounded-[2px_4px_4px_2px]",
          "border border-black/25",
          "transition-colors duration-500",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D462A6]",
          isDragging && "scale-105 shadow-lg shadow-black/40",
        )}
        style={{
          width,
          height,
          backgroundColor: coverColor,
          boxShadow:
            "2px 0 7px rgba(0,0,0,0.36), -1px 0 2px rgba(0,0,0,0.28), inset -4px 0 8px rgba(0,0,0,0.2), inset 1px 0 0 rgba(255,255,255,0.09)",
          transformOrigin: "bottom center",
        }}
        aria-label={`${fic.title} by ${fic.author}, ${STATUS_LABELS[status]}`}
        title={fic.title}
        {...attributes}
        {...listeners}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.12),transparent_18%,transparent_78%,rgba(0,0,0,0.18))]" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-white/10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[3px] bg-black/15" />
        <div className="pointer-events-none absolute left-[20%] right-[20%] top-3 h-px bg-white/15" />
        <div className="pointer-events-none absolute bottom-5 left-[20%] right-[20%] h-px bg-white/12" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-1 py-4">
          <span
            className="max-h-[calc(100%-42px)] overflow-hidden text-center font-sans font-semibold leading-tight tracking-[0.05em] text-white/76 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] transition-colors duration-500 group-hover:text-white/92"
            style={{
              fontSize: spineTitleFontSize,
              writingMode: "vertical-rl",
              textOrientation: "mixed",
            }}
          >
            {spineTitle}
          </span>
          <span
            className="mt-2 size-[6px] shrink-0 rounded-full"
            style={{
              backgroundColor: ratingColor,
              boxShadow: `0 0 8px ${ratingColor}`,
            }}
          />
        </div>

        <div
          className="absolute inset-x-0 bottom-0 h-[3px]"
          style={{ backgroundColor: statusColor, opacity: status === "none" ? 0 : 0.72 }}
        />

        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(ellipse at center, ${ratingColor}18 0%, transparent 70%)`,
          }}
        />
      </motion.button>
    </div>
  );
}
