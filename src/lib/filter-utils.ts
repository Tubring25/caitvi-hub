import { VIBES, WORD_COUNT_RANGES } from '@/types/filters';
import type { FilterState, VibeKey } from '@/types/filters';
import { CONTENT_SIGNAL_CONFIG } from '@/types/fic';
import type { ContentSignal, Rating } from '@/types/fic';

const VALID_RATINGS: Rating[] = ['G', 'T', 'M', 'E'];
const VALID_VIBES = VIBES.map((vibe) => vibe.key);
const VALID_SIGNALS = Object.keys(CONTENT_SIGNAL_CONFIG) as ContentSignal[];

export function escapeLike(str: string): string {
  return str.replace(/[%_\\]/g, (ch) => `\\${ch}`);
}

export function buildFilterParams(filters: FilterState): string {
  const params = new URLSearchParams();

  const q = filters.q.trim();
  if (q) params.set('q', q);

  if (filters.ratings.length > 0) {
    params.set('ratings', filters.ratings.join(','));
  }

  if (filters.wordCount !== 'any') {
    const range = WORD_COUNT_RANGES[filters.wordCount];
    if (range.min !== undefined) params.set('minWords', String(range.min));
    if (range.max !== undefined) params.set('maxWords', String(range.max));
  }

  const vibes = VALID_VIBES.filter((vibe) => filters.vibes.includes(vibe));
  if (vibes.length > 0) {
    params.set('vibes', vibes.join(','));
  }

  const signals = VALID_SIGNALS.filter((signal) => filters.signals.includes(signal));
  if (signals.length > 0) {
    params.set('signals', signals.join(','));
  }

  return params.toString();
}

export interface ParsedFilterParams {
  q?: string;
  ratings?: Rating[];
  minWords?: number;
  maxWords?: number;
  vibes?: VibeKey[];
  signals?: ContentSignal[];
}

export function parseFilterParams(url: URL): ParsedFilterParams {
  const q = url.searchParams.get('q')?.trim() || undefined;

  const rawVibes = url.searchParams.get('vibes');
  let vibes: VibeKey[] | undefined;
  if (rawVibes) {
    vibes = [...new Set(
      rawVibes.split(',')
        .map((vibe) => vibe.trim().toLowerCase())
        .filter((vibe): vibe is VibeKey => VALID_VIBES.includes(vibe as VibeKey)),
    )];
    if (vibes.length === 0) vibes = undefined;
  }

  const rawRatings = url.searchParams.get('ratings');
  let ratings: Rating[] | undefined;
  if (rawRatings) {
    ratings = [...new Set(
      rawRatings.split(',')
        .map((r) => r.trim().toUpperCase())
        .filter((r): r is Rating => VALID_RATINGS.includes(r as Rating))
    )];
    if (ratings.length === 0) ratings = undefined;
  }

  const rawSignals = url.searchParams.get('signals');
  let signals: ContentSignal[] | undefined;
  if (rawSignals) {
    signals = [...new Set(
      rawSignals.split(',')
        .map((signal) => signal.trim().toLowerCase())
        .filter((signal): signal is ContentSignal => VALID_SIGNALS.includes(signal as ContentSignal)),
    )];
    if (signals.length === 0) signals = undefined;
  }

  let minWords = parseNonNegativeInt(url.searchParams.get('minWords'));
  let maxWords = parseNonNegativeInt(url.searchParams.get('maxWords'));
  if (minWords !== undefined && maxWords !== undefined && minWords > maxWords) {
    [minWords, maxWords] = [maxWords, minWords];
  }

  return { q, ratings, minWords, maxWords, vibes, signals };
}

function parseNonNegativeInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) return undefined;
  return parsed;
}
