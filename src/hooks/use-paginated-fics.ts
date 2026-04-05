import type { Fic } from "@/types/fic";
import type { FilterState } from "@/types/filters";
import { buildFilterParams } from "@/lib/filter-utils";
import { useCallback, useEffect, useRef, useState } from "react";

interface FicsPageResponse {
  items: Fic[];
  total?: number;
  hasMore: boolean;
  nextOffset: number;
}

interface PaginatedFicsResult {
  items: Fic[];
  total: number | null;
  error: Error | null;
  isInitialLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export const usePaginatedFics = (pageSize: number, filters: FilterState): PaginatedFicsResult => {
  const [items, setItems] = useState<Fic[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [debouncedQ, setDebouncedQ] = useState(filters.q);

  const nextOffsetRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const reqIdRef = useRef(0);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  // Debounce q input by 250ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(filters.q), 250);
    return () => clearTimeout(timer);
  }, [filters.q]);

  // Build the effective filters with debounced q
  const effectiveFilters: FilterState = {
    ...filters,
    q: debouncedQ,
  };
  const filterParams = buildFilterParams(effectiveFilters);

  const fetchPage = useCallback(async (offset: number, paramStr: string): Promise<FicsPageResponse | null> => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const reqId = ++reqIdRef.current;

    try {
      const sep = paramStr ? '&' : '';
      const url = `/api/fics?limit=${pageSize}&offset=${offset}${sep}${paramStr}`;
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`Failed to fetch fics: ${response.status}`);
      }

      const data = await response.json() as FicsPageResponse;
      if (!Array.isArray(data.items)) {
        throw new Error("Unexpected API response format");
      }

      if (reqId !== reqIdRef.current) return null;

      setError(null);
      return data;
    } catch (error) {
      if ((error as Error).name === "AbortError") return null;
      if (reqId === reqIdRef.current) {
        setError(error instanceof Error ? error : new Error(String(error)));
      }
      return null;
    }
  }, [pageSize]);

  // Reset + refetch when filters change (debounced q already applied)
  useEffect(() => {
    let cancelled = false;

    const loadInitial = async () => {
      setIsInitialLoading(true);
      setItems([]);
      setTotal(null);
      setHasMore(true);
      setError(null);
      nextOffsetRef.current = 0;
      loadingMoreRef.current = false;

      const data = await fetchPage(0, filterParams);
      if (cancelled) return;

      if (data) {
        setItems(data.items);
        setTotal(data.total ?? null);
        setHasMore(data.hasMore);
        nextOffsetRef.current = data.nextOffset;
      }
      setIsInitialLoading(false);
    };

    void loadInitial();

    return () => {
      cancelled = true;
    };
  }, [fetchPage, filterParams]);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore) return;
    loadingMoreRef.current = true;
    setIsLoadingMore(true);

    const data = await fetchPage(nextOffsetRef.current, filterParams);
    if (data) {
      setItems((prev) => [...prev, ...data.items]);
      setHasMore(data.hasMore);
      nextOffsetRef.current = data.nextOffset;
    }

    loadingMoreRef.current = false;
    setIsLoadingMore(false);
  }, [fetchPage, filterParams, hasMore]);

  return { items, total, error, hasMore, isInitialLoading, isLoadingMore, loadMore };
};
