import { CONTENT_SIGNAL_CONFIG, RATING_CONFIG, type ContentSignal, type Rating } from '@/types/fic';
import { VIBES } from '@/types/filters';
import type { FilterState } from '@/types/filters';
import FilterPill from './FilterPill';
import WordCountSelector from './WordCountSelector';

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const RATING_FILTER_STYLES: Record<Rating, string> = {
  G: "border-[#4ade80]/60 bg-[#4ade80]/15 text-[#9af2b8]",
  T: "border-[#60a5fa]/60 bg-[#60a5fa]/15 text-[#bfdbfe]",
  M: "border-[#facc15]/60 bg-[#facc15]/15 text-[#fde68a]",
  E: "border-[#ef4444]/60 bg-[#ef4444]/15 text-[#fca5a5]",
};

const RATING_OPTIONS = (Object.entries(RATING_CONFIG) as [Rating, typeof RATING_CONFIG[Rating]][]).map(
  ([value, config]) => ({
    value,
    label: config.label,
    activeClassName: RATING_FILTER_STYLES[value],
  })
);

const SIGNAL_OPTIONS: ContentSignal[] = [
  'slow_burn',
  'heavy_angst',
  'tooth_rotting_fluff',
  'comfort_read',
  'modern_au',
  'long_read',
];

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const toggleRating = (r: Rating) => {
    const next = filters.ratings.includes(r)
      ? filters.ratings.filter((v) => v !== r)
      : [...filters.ratings, r];
    onChange({ ...filters, ratings: next });
  };

  const toggleVibe = (vibe: FilterState["vibes"][number]) => {
    const vibes = filters.vibes.includes(vibe)
      ? filters.vibes.filter((value) => value !== vibe)
      : [...filters.vibes, vibe];
    onChange({ ...filters, vibes });
  };

  const toggleSignal = (signal: ContentSignal) => {
    const signals = filters.signals.includes(signal)
      ? filters.signals.filter((value) => value !== signal)
      : [...filters.signals, signal];
    onChange({ ...filters, signals });
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-col items-start gap-3 xl:flex-row xl:flex-wrap xl:items-center">
        <div className="flex w-full min-w-0 items-center gap-3 xl:w-auto">
          <span className="w-14 shrink-0 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">
            Rating
          </span>
          <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:overflow-visible xl:pb-0">
            {RATING_OPTIONS.map((option) => (
              <FilterPill
                key={option.value}
                active={filters.ratings.includes(option.value)}
                onClick={() => toggleRating(option.value)}
                activeClassName={option.activeClassName}
              >
                {option.label}
              </FilterPill>
            ))}
          </div>
        </div>

        <div className="hidden h-6 w-px bg-white/[0.08] xl:block" />

        <WordCountSelector
          value={filters.wordCount}
          onChange={(wordCount) => onChange({ ...filters, wordCount })}
        />

        <div className="hidden h-6 w-px bg-white/[0.08] xl:block" />

        <div className="flex w-full min-w-0 items-start gap-3 xl:w-auto xl:items-center">
          <span className="w-14 shrink-0 pt-3 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white/35 xl:pt-0">
            Vibe
          </span>
          <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:flex-wrap xl:overflow-visible xl:pb-0">
            {VIBES.map((vibe) => (
              <FilterPill
                key={vibe.key}
                active={filters.vibes.includes(vibe.key)}
                onClick={() => toggleVibe(vibe.key)}
                activeClassName="normal-case tracking-normal"
              >
                <span aria-hidden="true">{vibe.emoji}</span>
                <span className="normal-case tracking-normal">{vibe.shortLabel}</span>
              </FilterPill>
            ))}
          </div>
        </div>

        <div className="hidden h-6 w-px bg-white/[0.08] xl:block" />

        <div className="flex w-full min-w-0 items-start gap-3 xl:w-auto xl:items-center">
          <span className="w-14 shrink-0 pt-3 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white/35 xl:pt-0">
            Signal
          </span>
          <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:flex-wrap xl:overflow-visible xl:pb-0">
            {SIGNAL_OPTIONS.map((signal) => (
              <FilterPill
                key={signal}
                active={filters.signals.includes(signal)}
                onClick={() => toggleSignal(signal)}
                activeClassName="normal-case tracking-normal"
              >
                <span className="normal-case tracking-normal">{CONTENT_SIGNAL_CONFIG[signal].label}</span>
              </FilterPill>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
