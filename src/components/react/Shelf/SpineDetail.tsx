import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Bookmark,
  BookOpen,
  CheckCircle,
  ExternalLink,
  FileText,
  X,
  XCircle,
} from "lucide-react";
import type { Fic, ReadingStatus } from "@/types/fic";
import { RATING_CONFIG } from "@/types/fic";
import { cn } from "@/lib/utils";
import { RATING_COLORS } from "./BookSpine";
import type { ReactNode } from "react";

const STATUS_OPTIONS: {
  key: ReadingStatus;
  icon: ReactNode;
  label: string;
}[] = [
  { key: "bookmarked", icon: <Bookmark size={14} />, label: "To Read" },
  { key: "reading", icon: <BookOpen size={14} />, label: "Reading" },
  { key: "completed", icon: <CheckCircle size={14} />, label: "Completed" },
  { key: "dropped", icon: <XCircle size={14} />, label: "Dropped" },
];

const STATUS_LABELS: Record<ReadingStatus, string> = {
  none: "Unsorted",
  bookmarked: "To Read",
  reading: "Reading",
  completed: "Completed",
  dropped: "Dropped",
};

const STATUS_COLORS: Record<ReadingStatus, string> = {
  none: "rgba(255,255,255,0.28)",
  bookmarked: "#D4AF37",
  reading: "#60a5fa",
  completed: "#4ade80",
  dropped: "rgba(255,255,255,0.52)",
};

const SHELF_NOTES: Record<ReadingStatus, string> = {
  none: "Evidence not yet shelved.",
  bookmarked: "Filed for future emotional damage.",
  reading: "Active investigation ongoing.",
  completed: "Case closed. Feelings unresolved.",
  dropped: "Evidence sealed by reader request.",
};

const MOOD_CONFIG: {
  key: keyof Fic["state"];
  label: string;
  color: string;
}[] = [
  { key: "spice", label: "spice", color: "#D52D00" },
  { key: "angst", label: "angst", color: "#7b2ff7" },
  { key: "fluff", label: "fluff", color: "#D462A6" },
  { key: "plot", label: "plot", color: "#60a5fa" },
  { key: "romance", label: "romance", color: "#EF7627" },
];

const CHARACTER_TAG_PATTERNS = [
  /\bCaitlyn\b/i,
  /\bVi\b/i,
  /\bJinx\b/i,
  /\bPowder\b/i,
  /\bSilco\b/i,
  /\bJayce\b/i,
  /\bViktor\b/i,
  /\bMel\b/i,
  /\bEkko\b/i,
  /\bSevika\b/i,
  /\bSarah\b/i,
  /\bFortune\b/i,
  /\bKiramman\b/i,
  /\bTalis\b/i,
];

interface SpineDetailProps {
  fic: Fic;
  currentStatus: ReadingStatus;
  onStatusChange: (ficId: string, status: ReadingStatus) => void;
  onClose: () => void;
}

function formatCompactNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

function getTextBlock(value?: string | null): string {
  return value?.replace(/\\n/g, "\n").trim() ?? "";
}

function isUsefulShelfTag(tag: string): boolean {
  const normalized = tag.trim();
  if (!normalized) return false;
  if (/^(F\/F|F\/M|M\/M|Multi|Other)$/i.test(normalized)) return false;
  if (normalized.includes("/") || normalized.includes("&")) return false;
  if (/\b(Arcane|League of Legends|Piltover's Finest)\b/i.test(normalized)) return false;
  return !CHARACTER_TAG_PATTERNS.some((pattern) => pattern.test(normalized));
}

function getDisplayTags(fic: Fic): string[] {
  const tags = [fic.category, ...fic.tags].filter(isUsefulShelfTag);
  return Array.from(new Set(tags)).slice(0, 6);
}

export function SpineDetail({
  fic,
  currentStatus,
  onStatusChange,
  onClose,
}: SpineDetailProps) {
  const ratingColor = RATING_COLORS[fic.rating];
  const ratingConfig = RATING_CONFIG[fic.rating];
  const summary = getTextBlock(fic.summary);
  const quote = getTextBlock(fic.quote);
  const displayTags = getDisplayTags(fic);
  const wordDisplay = `${formatCompactNumber(fic.stats.words)} words`;
  const activeStatusColor = STATUS_COLORS[currentStatus];
  const [titleClicks, setTitleClicks] = useState(0);
  const [shelfNote, setShelfNote] = useState("");

  const handleStatusClick = (status: ReadingStatus) => {
    onStatusChange(fic.id, currentStatus === status ? "none" : status);
  };

  const handleTitleClick = () => {
    setTitleClicks((clicks) => {
      const nextClicks = clicks + 1;
      if (nextClicks >= 3) {
        setShelfNote(fic.rating === "E" ? "Handle with gloves." : SHELF_NOTES[currentStatus]);
        return 0;
      }
      return nextClicks;
    });
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
        className="fixed inset-0 z-40 bg-[rgba(4,2,6,0.82)] backdrop-blur-[6px]"
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 pointer-events-none sm:px-6">
        <motion.div
          layoutId={`book-${fic.id}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`shelf-book-${fic.id}`}
          className="shelf-detail-scroll pointer-events-auto relative grid max-h-[88vh] w-full max-w-[860px] overflow-y-auto rounded-[4px_8px_8px_4px] border border-[rgba(212,175,55,0.18)] bg-[rgba(30,19,23,0.98)] shadow-[0_24px_80px_rgba(0,0,0,0.58),0_2px_8px_rgba(0,0,0,0.32)] md:min-h-[520px] md:grid-cols-[0.95fr_1.05fr] md:overflow-hidden"
        >
          <button
            onClick={onClose}
            aria-label="Close detail"
            className="absolute right-3 top-3 z-20 flex size-8 items-center justify-center rounded-full border border-white/[0.08] bg-black/35 text-white/45 transition-colors duration-200 hover:border-white/[0.16] hover:bg-black/55 hover:text-white/75"
          >
            <X size={16} />
          </button>

          <div className="pointer-events-none absolute bottom-1/2 left-0 right-0 z-10 h-[5px] bg-[linear-gradient(180deg,rgba(0,0,0,0.24),rgba(255,255,255,0.02),rgba(0,0,0,0.2))] md:bottom-0 md:left-1/2 md:right-auto md:top-0 md:h-auto md:w-[6px] md:-translate-x-1/2 md:bg-[linear-gradient(90deg,rgba(0,0,0,0.28),rgba(255,255,255,0.025),rgba(0,0,0,0.28))]" />

          <section className="relative flex min-h-[310px] flex-col overflow-hidden border-b border-white/[0.05] bg-[linear-gradient(145deg,rgba(47,31,34,0.99),rgba(28,18,22,0.99))] p-7 sm:p-8 md:border-b-0 md:border-r md:p-8">
            <div className="pointer-events-none absolute inset-4 rounded-[2px] border border-[#D4AF37]/[0.14]" />
            <div className="pointer-events-none absolute left-6 top-5 font-mono text-[8px] text-[#D4AF37]/45">
              CASE #{fic.rating}-{fic.id}
            </div>

            <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
              <div
                className="mb-6 rounded-[3px] border px-3 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.18em]"
                style={{
                  borderColor: `${ratingColor}44`,
                  color: ratingColor,
                  backgroundColor: `${ratingColor}12`,
                }}
              >
                {ratingConfig.description}
              </div>

              <div className="mb-5 h-px w-12 bg-[linear-gradient(to_right,transparent,rgba(212,175,55,0.24),transparent)]" />

              <button
                type="button"
                id={`shelf-book-${fic.id}`}
                onClick={handleTitleClick}
                className="max-w-[17ch] border-0 bg-transparent p-0 text-center font-decorative text-[clamp(1.45rem,4vw,2rem)] leading-[1.15] tracking-wide text-white/92 transition-colors hover:text-white"
              >
                {fic.title}
              </button>

              <div className="my-4 flex items-center gap-3 text-[#D4AF37]/18">
                <span className="h-px w-7 bg-[#D4AF37]/14" />
                <span className="font-mono text-[8px] tracking-[0.5em]">✦</span>
                <span className="h-px w-7 bg-[#D4AF37]/14" />
              </div>

              <p className="font-serif text-sm italic text-[#D462A6]/78">
                by {fic.author}
              </p>

              {shelfNote && (
                <p className="mt-4 rounded-[4px] border border-[#D4AF37]/15 bg-black/15 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[#D4AF37]/58">
                  {shelfNote}
                </p>
              )}

              {quote && (
                <p className="mt-7 line-clamp-5 max-w-[28ch] whitespace-pre-line font-serif text-[13px] italic leading-[1.75] text-white/68">
                  {quote}
                </p>
              )}
            </div>

            <div className="relative z-10 mt-7 flex items-center justify-center gap-4 border-t border-white/[0.07] pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white/58">
              <span>{STATUS_LABELS[currentStatus]}</span>
              <span className="size-1 rounded-full" style={{ backgroundColor: activeStatusColor }} />
              <span>{wordDisplay}</span>
            </div>
          </section>

          <section className="shelf-detail-scroll relative max-h-none overflow-visible bg-[linear-gradient(215deg,rgba(43,28,32,0.99),rgba(28,18,22,0.99))] p-7 sm:p-8 md:max-h-[520px] md:overflow-y-auto">
            <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_28px,rgba(255,255,255,0.014)_28px,rgba(255,255,255,0.014)_29px)]" />

            <div className="relative z-10 space-y-6">
              <div>
                <div className="mb-3 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.28em] text-[#D4AF37]/62">
                  Mood Trace
                  <span className="h-px flex-1 bg-[linear-gradient(to_right,rgba(212,175,55,0.12),transparent)]" />
                </div>
                <div className="space-y-2">
                  {MOOD_CONFIG.map((mood) => {
                    const value = fic.state[mood.key];
                    return (
                      <div key={mood.key} className="grid grid-cols-[56px_1fr_18px] items-center gap-2">
                        <span className="text-right font-mono text-[9px] lowercase text-white/58">
                          {mood.label}
                        </span>
                        <div className="h-[6px] overflow-hidden rounded-full bg-white/[0.09]">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${value * 20}%`, backgroundColor: mood.color }}
                          />
                        </div>
                        <span className="text-right font-mono text-[9px] text-white/48">
                          {value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.28em] text-[#D4AF37]/62">
                  Operative Summary
                  <span className="h-px flex-1 bg-[linear-gradient(to_right,rgba(212,175,55,0.12),transparent)]" />
                </div>
                <p className="line-clamp-6 whitespace-pre-line font-serif text-[14px] leading-[1.85] text-white/78">
                  {summary}
                </p>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.28em] text-[#D4AF37]/62">
                  Field Stats
                  <span className="h-px flex-1 bg-[linear-gradient(to_right,rgba(212,175,55,0.12),transparent)]" />
                </div>
                <div className="grid grid-cols-2 gap-x-5 gap-y-2">
                  {[
                    ["Words", wordDisplay],
                    ["Comments", formatCompactNumber(fic.stats.comments)],
                    ["Kudos", formatCompactNumber(fic.stats.kudos)],
                    ["Bookmarks", formatCompactNumber(fic.stats.bookmarks)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-baseline gap-2 border-b border-white/[0.07] py-1.5">
                      <span className="font-mono text-sm font-medium text-white/84">
                        {value}
                      </span>
                      <span className="text-[10px] text-white/52">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {displayTags.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.28em] text-[#D4AF37]/62">
                    Tags
                    <span className="h-px flex-1 bg-[linear-gradient(to_right,rgba(212,175,55,0.12),transparent)]" />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {displayTags.map((tag) => (
                      <span
                        key={tag}
                        className={cn(
                          "rounded-[3px] border px-2.5 py-1 text-[10px] leading-tight",
                          tag === fic.category
                            ? "border-[#D4AF37]/24 bg-[#D4AF37]/10 text-[#E8C45C]/80"
                            : "border-white/[0.1] bg-white/[0.035] text-white/66",
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="mb-3 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.28em] text-[#D4AF37]/62">
                  Shelf Status
                  <span className="h-px flex-1 bg-[linear-gradient(to_right,rgba(212,175,55,0.12),transparent)]" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.map((opt) => {
                    const isActive = currentStatus === opt.key;
                    const statusColor = STATUS_COLORS[opt.key];
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleStatusClick(opt.key)}
                        className={cn(
                          "flex min-h-[40px] items-center justify-center gap-2 rounded-[4px] border px-3 py-2 text-xs transition-colors duration-300",
                          isActive
                            ? "border-current bg-white/[0.06] text-white"
                            : "border-white/[0.08] bg-white/[0.025] text-white/58 hover:bg-white/[0.05] hover:text-white/82",
                        )}
                        style={isActive ? { color: statusColor } : undefined}
                      >
                        {opt.icon}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-white/[0.05] pt-5 sm:flex-row sm:items-center">
                <a
                  href={fic.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[4px] bg-gradient-to-r from-[#D462A6] to-[#A30262] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(212,98,166,0.22)] transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <ExternalLink size={14} />
                  Read on AO3
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
                <a
                  href={`/fic/${fic.id}`}
                  className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[4px] border border-white/[0.08] bg-white/[0.025] px-5 py-2.5 text-sm text-white/62 transition-colors duration-300 hover:bg-white/[0.05] hover:text-white/86 sm:ml-auto"
                >
                  <FileText size={14} />
                  View Dossier
                </a>
              </div>
            </div>
          </section>
        </motion.div>
      </div>
    </>
  );
}
