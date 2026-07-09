import { useCallback, useEffect, useState } from "react";

import { buildFilterParams, parseFilterParams } from "@/lib/filter-utils";
import { DEFAULT_FILTERS } from "@/types/filters";
import type { FilterState } from "@/types/filters";

export function useFicFilters(): {
  filters: FilterState;
  setFilters: (next: FilterState | ((prev: FilterState) => FilterState)) => void;
  resetFilters: () => void;
  isReady: boolean;
} {
  const [filters, setFiltersState] = useState<FilterState>(DEFAULT_FILTERS);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const syncFromUrl = () => {
      const parsed = parseFilterParams(new URL(window.location.href));
      setFiltersState({
        ...DEFAULT_FILTERS,
        q: parsed.q ?? DEFAULT_FILTERS.q,
        ratings: parsed.ratings ?? DEFAULT_FILTERS.ratings,
        wordCount: getWordCountBucket(parsed.minWords, parsed.maxWords),
        vibes: parsed.vibes ?? DEFAULT_FILTERS.vibes,
        signals: parsed.signals ?? DEFAULT_FILTERS.signals,
      });
      setIsReady(true);
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const setFilters = useCallback((next: FilterState | ((prev: FilterState) => FilterState)) => {
    setFiltersState((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      const query = buildFilterParams(resolved);
      const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
      window.history.replaceState(null, "", url);
      return resolved;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, [setFilters]);

  return { filters, setFilters, resetFilters, isReady };
}

function getWordCountBucket(minWords?: number, maxWords?: number): FilterState["wordCount"] {
  if (minWords === undefined && maxWords === undefined) return "any";
  if (minWords === 0 && maxWords === 4999) return "short";
  if (minWords === 5000 && maxWords === 19999) return "medium";
  if (minWords === 20000 && maxWords === 49999) return "long";
  if (minWords === 50000 && maxWords === 99999) return "epic";
  if (minWords === 100000 && maxWords === undefined) return "legendary";
  return "any";
}
