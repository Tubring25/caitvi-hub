import { WORD_COUNT_RANGES } from '@/types/filters';
import type { FilterState, SortOption, WordCountBucket } from '@/types/filters';
import type { Rating } from '@/types/fic';

const VALID_SORTS: SortOption[] = ['default', 'kudos', 'words_desc', 'words_asc'];
const VALID_RATINGS: Rating[] = ['G', 'T', 'M', 'E'];
const VALID_STATUSES = ['completed', 'ongoing'] as const;

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

  if (filters.status) {
    params.set('status', filters.status);
  }

  if (filters.sort !== 'default') {
    params.set('sort', filters.sort);
  }

  if (filters.wordCount !== 'any') {
    const range = WORD_COUNT_RANGES[filters.wordCount];
    if (range.min !== undefined) params.set('minWords', String(range.min));
    if (range.max !== undefined) params.set('maxWords', String(range.max));
  }

  return params.toString();
}

export interface ParsedFilterParams {
  q?: string;
  ratings?: Rating[];
  status?: 'completed' | 'ongoing';
  sort: SortOption;
  minWords?: number;
  maxWords?: number;
}

export function parseFilterParams(url: URL): ParsedFilterParams {
  const q = url.searchParams.get('q')?.trim() || undefined;

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

  const rawStatus = url.searchParams.get('status');
  const status = rawStatus && VALID_STATUSES.includes(rawStatus as typeof VALID_STATUSES[number])
    ? (rawStatus as 'completed' | 'ongoing')
    : undefined;

  const rawSort = url.searchParams.get('sort');
  const sort: SortOption = rawSort && VALID_SORTS.includes(rawSort as SortOption)
    ? (rawSort as SortOption)
    : 'default';

  let minWords = parseNonNegativeInt(url.searchParams.get('minWords'));
  let maxWords = parseNonNegativeInt(url.searchParams.get('maxWords'));
  if (minWords !== undefined && maxWords !== undefined && minWords > maxWords) {
    [minWords, maxWords] = [maxWords, minWords];
  }

  return { q, ratings, status, sort, minWords, maxWords };
}

function parseNonNegativeInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) return undefined;
  return parsed;
}
