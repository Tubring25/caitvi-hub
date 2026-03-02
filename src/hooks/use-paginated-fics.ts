import type { Fic } from "@/types/fic";
import { useCallback, useEffect, useRef, useState } from "react";


interface FicsPageResponse {
  items: Fic[];
  hasMore: boolean;
  nextOffset: number;
}

interface PaginatedFicsResult {
  items: Fic[];
  error: Error | null;
  isInitialLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadInitial: () => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
}

export const usePaginatedFics = (pageSize: number): PaginatedFicsResult => {
  const [items, setItems] = useState<Fic[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const nextOffsetRef = useRef(0)
  const loadingMoreRef = useRef(false)
  const abortRef = useRef<AbortController | null>(null)
  const reqIdRef = useRef(0)

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  const fetchPage = useCallback(async (offset: number): Promise<FicsPageResponse | null> => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller;
    const reqId  = ++reqIdRef.current;

    try {
      const response = await fetch(`/api/fics?limit=${pageSize}&offset=${offset}`, {
        signal: controller.signal
      })
      if (!response.ok) {
        throw new Error(`Failed to fetch fics: ${response.status}`)
      }

      const data = await response.json() as FicsPageResponse;
      if (!Array.isArray(data.items)) {
        throw new Error("Unexpected API response format");
      }

      if (reqId !== reqIdRef.current) {
        throw new Error("Request aborted");
      }
      
      setError(null)
      return data;
    } catch (error) {
      if ((error as Error).name === "AbortError") return null

      if (reqId === reqIdRef.current) setError(error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }, [pageSize])

  const loadInitial = useCallback(async () => {
    setIsInitialLoading(true)
    nextOffsetRef.current = 0
    const data = await fetchPage(0);
    if(data) {
      setItems(data.items)
      setHasMore(data.hasMore)
      nextOffsetRef.current = data.nextOffset
    }
    setIsInitialLoading(false)
  }, [fetchPage])

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore) return;
    loadingMoreRef.current = true;
    setIsLoadingMore(true)

    const data = await fetchPage(nextOffsetRef.current);
    if (data) {
      setItems(prev => [...prev, ...data.items])
      setHasMore(data.hasMore)
      nextOffsetRef.current = data.nextOffset
    }

    loadingMoreRef.current = false;
    setIsLoadingMore(false)
  }, [fetchPage, hasMore])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setItems([])
    setError(null)
    setHasMore(true)
    setIsInitialLoading(false)
    setIsLoadingMore(false)
    nextOffsetRef.current = 0
    loadingMoreRef.current = false
  }, [])

  return { items, error, hasMore, isInitialLoading, isLoadingMore, loadInitial, loadMore, reset };
}