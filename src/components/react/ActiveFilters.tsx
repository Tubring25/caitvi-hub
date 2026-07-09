import { X } from "lucide-react";

import { CONTENT_SIGNAL_CONFIG, RATING_CONFIG } from "@/types/fic";
import type { ContentSignal } from "@/types/fic";
import { DEFAULT_FILTERS, VIBES, WORD_COUNT_RANGES } from "@/types/filters";
import type { FilterState, VibeKey } from "@/types/filters";

interface ActiveFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}

export default function ActiveFilters({ filters, onChange, onReset }: ActiveFiltersProps) {
  const chips = getChips(filters);
  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto border-t border-white/[0.05] pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => chip.remove(filters, onChange)}
          className="inline-flex min-h-[36px] max-w-[240px] shrink-0 items-center gap-2 rounded-[4px] border border-[var(--lesbian-pink)]/40 bg-[var(--lesbian-pink)]/10 px-3 font-mono text-[10px] uppercase tracking-[0.1em] text-white/75 transition hover:border-[var(--lesbian-pink)]/65 hover:text-white"
        >
          <span className="truncate">{chip.label}</span>
          <X className="size-3.5" />
        </button>
      ))}
      <button
        type="button"
        onClick={onReset}
        className="inline-flex min-h-[36px] shrink-0 items-center rounded-[4px] px-3 font-mono text-[10px] uppercase tracking-[0.1em] text-white/40 transition hover:text-white/75"
      >
        Clear all
      </button>
    </div>
  );
}

interface FilterChip {
  key: string;
  label: string;
  remove: (filters: FilterState, onChange: (filters: FilterState) => void) => void;
}

function getChips(filters: FilterState): FilterChip[] {
  const chips: FilterChip[] = [];

  if (filters.q.trim()) {
    chips.push({
      key: "query",
      label: `Search: ${filters.q.trim()}`,
      remove: (current, onChange) => onChange({ ...current, q: DEFAULT_FILTERS.q }),
    });
  }

  for (const rating of filters.ratings) {
    chips.push({
      key: `rating-${rating}`,
      label: RATING_CONFIG[rating].label,
      remove: (current, onChange) => onChange({
        ...current,
        ratings: current.ratings.filter((value) => value !== rating),
      }),
    });
  }

  if (filters.wordCount !== DEFAULT_FILTERS.wordCount) {
    chips.push({
      key: `word-${filters.wordCount}`,
      label: WORD_COUNT_RANGES[filters.wordCount].label,
      remove: (current, onChange) => onChange({ ...current, wordCount: DEFAULT_FILTERS.wordCount }),
    });
  }

  for (const vibe of filters.vibes) {
    const meta = VIBES.find((item) => item.key === vibe);
    chips.push({
      key: `vibe-${vibe}`,
      label: meta?.shortLabel ?? vibe,
      remove: (current, onChange) => onChange({
        ...current,
        vibes: current.vibes.filter((value) => value !== (vibe as VibeKey)),
      }),
    });
  }

  for (const signal of filters.signals) {
    chips.push({
      key: `signal-${signal}`,
      label: CONTENT_SIGNAL_CONFIG[signal].label,
      remove: (current, onChange) => onChange({
        ...current,
        signals: current.signals.filter((value) => value !== (signal as ContentSignal)),
      }),
    });
  }

  return chips;
}
