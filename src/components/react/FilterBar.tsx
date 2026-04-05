import { cn } from '@/lib/utils';
import { RATING_CONFIG, type Rating } from '@/types/fic';
import type { FilterState } from '@/types/filters';
import FilterPill from './FilterPill';
import SortSelect from './SortSelect';
import WordCountSelector from './WordCountSelector';
import { Check, X } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const RATING_OPTIONS = (Object.entries(RATING_CONFIG) as [Rating, typeof RATING_CONFIG[Rating]][]).map(
  ([value, config]) => ({
    value,
    label: config.label,
    activeClassName: cn(config.color, 'border-transparent'),
  })
);

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const toggleRating = (r: Rating) => {
    const next = filters.ratings.includes(r)
      ? filters.ratings.filter((v) => v !== r)
      : [...filters.ratings, r];
    onChange({ ...filters, ratings: next });
  };

  const toggleStatus = (status: 'completed' | 'ongoing') => {
    onChange({
      ...filters,
      status: filters.status === status ? undefined : status,
    });
  };

  return (
    <div className="space-y-3 mt-6">
      {/* Row 1: Sort + Rating + Status */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <SortSelect
          value={filters.sort}
          onChange={(sort) => onChange({ ...filters, sort })}
        />

        <div className="w-px h-6 bg-white/10 hidden sm:block" />

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-white/40 uppercase tracking-widest font-bold shrink-0">
            Rating
          </span>
          <div className="flex gap-2">
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

        <div className="w-px h-6 bg-white/10 hidden sm:block" />

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-white/40 uppercase tracking-widest font-bold shrink-0">
            Status
          </span>
          <div className="flex gap-2">
            <FilterPill
              active={filters.status === 'completed'}
              onClick={() => toggleStatus('completed')}
            >
              <Check className="size-4" />
              Completed
            </FilterPill>
            <FilterPill
              active={filters.status === 'ongoing'}
              onClick={() => toggleStatus('ongoing')}
            >
              <X className="size-4" />
              Ongoing
            </FilterPill>
          </div>
        </div>
      </div>

      {/* Row 2: Word Count */}
      <div className="flex justify-center">
        <WordCountSelector
          value={filters.wordCount}
          onChange={(wordCount) => onChange({ ...filters, wordCount })}
        />
      </div>
    </div>
  );
}
