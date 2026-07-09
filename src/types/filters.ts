import type { ContentSignal, Rating } from './fic';

export type WordCountBucket = 'any' | 'short' | 'medium' | 'long' | 'epic' | 'legendary';

export type VibeKey = 'spice' | 'angst' | 'fluff' | 'plot' | 'romance';

export interface FilterState {
  q: string;
  ratings: Rating[];
  wordCount: WordCountBucket;
  vibes: VibeKey[];
  signals: ContentSignal[];
}

export interface VibeMeta {
  key: VibeKey;
  label: string;
  emoji: string;
  shortLabel: string;
}

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
  wordCount: 'any',
  vibes: [],
  signals: [],
};

export const VIBES: readonly VibeMeta[] = [
  { key: 'spice',   label: 'High Spice',    emoji: '🔥', shortLabel: 'Spice' },
  { key: 'angst',   label: 'Heavy Angst',   emoji: '💔', shortLabel: 'Angst' },
  { key: 'fluff',   label: 'Soft & Fluffy', emoji: '🌸', shortLabel: 'Fluff' },
  { key: 'plot',    label: 'Plot-Driven',   emoji: '📖', shortLabel: 'Plot' },
  { key: 'romance', label: 'Very Romantic', emoji: '💕', shortLabel: 'Romance' },
] as const;
