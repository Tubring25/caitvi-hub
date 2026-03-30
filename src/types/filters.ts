import type { Rating } from './fic';

export type SortOption = 'default' | 'kudos' | 'words_desc' | 'words_asc';

export type WordCountBucket = 'any' | 'short' | 'medium' | 'long' | 'epic' | 'legendary';

export interface FilterState {
  q: string;
  ratings: Rating[];
  status?: 'completed' | 'ongoing';
  sort: SortOption;
  wordCount: WordCountBucket;
}

export const SORT_OPTIONS = [
  { value: 'default',    label: 'Default' },
  { value: 'kudos',      label: 'Most Loved' },
  { value: 'words_desc', label: 'Longest' },
  { value: 'words_asc',  label: 'Shortest' },
] as const;

export const WORD_COUNT_RANGES: Record<WordCountBucket, { min?: number; max?: number; label: string; tooltip: string }> = {
  any:       { label: 'Any',       tooltip: 'All lengths' },
  short:     { min: 0,      max: 4999,   label: 'Short',     tooltip: '< 5k words' },
  medium:    { min: 5000,   max: 19999,  label: 'Medium',    tooltip: '5k – 20k words' },
  long:      { min: 20000,  max: 49999,  label: 'Long',      tooltip: '20k – 50k words' },
  epic:      { min: 50000,  max: 99999,  label: 'Epic',      tooltip: '50k – 100k words' },
  legendary: { min: 100000,              label: 'Legendary', tooltip: '100k+ words' },
};

export const DEFAULT_FILTERS: FilterState = {
  q: '',
  ratings: [],
  status: undefined,
  sort: 'default',
  wordCount: 'any',
};
