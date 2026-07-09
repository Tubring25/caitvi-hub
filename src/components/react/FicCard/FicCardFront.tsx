import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { CONTENT_SIGNAL_CONFIG } from "@/types/fic";
import ShelfStatusMenu from "../ShelfStatusMenu";
import type { Fic, Rating } from "@/types/fic";

interface FicCardFrontProps {
  fic: Fic;
}

const RATING_STYLES: Record<
  Rating,
  { label: string; accent: string; stamp: string }
> = {
  E: {
    label: "Explicit",
    accent: "bg-[var(--rating-e)]",
    stamp: "border-[var(--rating-e)]/30 text-[var(--rating-e)]/50",
  },
  M: {
    label: "Mature",
    accent: "bg-[var(--rating-m)]",
    stamp: "border-[var(--rating-m)]/30 text-[var(--rating-m)]/50",
  },
  T: {
    label: "Teen",
    accent: "bg-[var(--rating-t)]",
    stamp: "border-[var(--rating-t)]/30 text-[var(--rating-t)]/50",
  },
  G: {
    label: "General",
    accent: "bg-[var(--rating-g)]",
    stamp: "border-[var(--rating-g)]/30 text-[var(--rating-g)]/50",
  },
};

function formatCompactNumber(value: number): string {
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return `${value}`;
}

export const FicCardFront = ({ fic }: FicCardFrontProps) => {
  const summary = fic.summary.replace(/\\n/g, "\n").trim();
  const rating = RATING_STYLES[fic.rating];
  const signals = fic.contentSignals.slice(0, 2);
  const wordDisplay = fic.stats.words >= 1000
    ? `${Math.round(fic.stats.words / 1000)}k`
    : `${fic.stats.words}`;

  return (
    <div className="absolute inset-0 flex flex-col overflow-visible rounded-[4px] border border-[rgba(200,160,100,0.12)] bg-[linear-gradient(180deg,rgba(30,18,14,0.82)_0%,rgba(18,10,8,0.76)_100%)] px-5 pb-5 pl-6 pt-[52px] shadow-[4px_4px_24px_rgba(0,0,0,0.4),-1px_-1px_0_rgba(200,160,100,0.04)]">
      <span
        className={cn("absolute inset-y-0 left-0 w-[3px] opacity-85", rating.accent)}
        aria-hidden="true"
      />

      <span className="absolute left-6 top-[-1px] max-w-[calc(100%-3rem)] truncate rounded-b-[4px] border border-t-0 border-[rgba(200,160,100,0.18)] bg-[rgba(45,30,22,0.72)] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[rgba(200,160,100,0.75)]">
        CASE #{fic.rating}-{fic.id}
      </span>

      <div className="mb-3 flex min-h-[42px] items-start justify-between gap-3 border-b border-white/[0.06] pb-3">
        <div className="font-mono uppercase">
          <p className="text-[8px] tracking-[0.2em] text-white/30">Status</p>
          <p
            className={cn(
              "mt-1 text-[10px] font-bold tracking-[0.12em]",
              fic.status === "completed" ? "text-[#4ade80]/70" : "text-[#D4AF37]/70",
            )}
          >
            {fic.status === "completed" ? "Complete" : "Ongoing"}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rotate-[3deg] rounded-[4px] border-2 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.22em]",
            rating.stamp,
          )}
        >
          {rating.label}
        </span>
      </div>

      <div className="mb-4 min-h-[72px]">
        <p className="mb-1 font-mono text-[8px] uppercase tracking-[0.2em] text-white/30">
          RE: Subject of Investigation
        </p>
        <a
          href={`/fic/${fic.id}`}
          onClick={(event) => event.stopPropagation()}
          className="block"
        >
          <h3 className="mb-1 line-clamp-2 font-serif text-lg font-bold leading-[1.15] text-white/95 transition-colors duration-300 hover:text-[var(--lesbian-pink)]">
            {fic.title}
          </h3>
        </a>
        <p className="truncate font-mono text-[10px] text-[var(--lesbian-pink)]/70">
          Primary Agent: {fic.author}
        </p>
      </div>

      <div className="mb-4 shrink-0">
        <div className="mb-2 flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.2em] text-white/30">
          <span>Operative Summary</span>
          <span className="h-px flex-1 bg-white/[0.06]" aria-hidden="true" />
        </div>
        <p
          className={cn(
            "font-serif text-sm leading-[1.65] text-white/65",
            signals.length > 0 ? "line-clamp-2" : "line-clamp-3",
          )}
        >
          {summary}
        </p>
      </div>

      {signals.length > 0 && (
        <div className="mb-4 flex shrink-0 flex-wrap gap-2">
          {signals.map((signal) => (
            <span
              key={`${fic.id}-${signal}`}
              className="rounded-[4px] border border-[var(--lesbian-pink)]/15 bg-black/20 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.16em] text-white/45"
            >
              {CONTENT_SIGNAL_CONFIG[signal].label}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto border-t border-white/[0.06] font-mono">
        <div className="grid grid-cols-2 items-stretch">
          <div className="border-r border-white/[0.06] py-3 pr-3">
            <p className="text-[8px] uppercase tracking-[0.16em] text-white/25">Length</p>
            <p className="mt-1 text-[10px] text-white/65">{wordDisplay} words</p>
          </div>
          <div className="py-3 pl-3">
            <p className="text-[8px] uppercase tracking-[0.16em] text-white/25">Kudos</p>
            <p className="mt-1 text-[10px] text-white/65">{formatCompactNumber(fic.stats.kudos)}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-white/[0.06] pt-3">
          <ShelfStatusMenu ficId={fic.id} align="left" />
          <a
            href={`/fic/${fic.id}`}
            onClick={(event) => event.stopPropagation()}
            aria-label={`Open dossier for ${fic.title}`}
            className="inline-flex items-center gap-1.5 rounded-[4px] border border-[var(--lesbian-pink)]/20 bg-[var(--lesbian-pink)]/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--lesbian-pink)]/80 transition-colors duration-300 hover:border-[var(--lesbian-pink)]/40 hover:bg-[var(--lesbian-pink)]/15 hover:text-[var(--lesbian-pink)]"
          >
            Open dossier <ArrowRight size={10} />
          </a>
        </div>
      </div>
    </div>
  );
};
