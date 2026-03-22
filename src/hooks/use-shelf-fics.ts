import type { Fic, ReadingStatus } from "@/types/fic";
import { useCallback, useEffect, useState } from "react";
import { getFicsCache, STORAGE_KEY } from "@/lib/storage";

export interface ShelfEntry {
  fic: Fic;
  status: ReadingStatus;
}

type OrderMap = Record<string, string[]>;

function loadOrderMap(): OrderMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY.SHELF_ORDER);
    return raw ? (JSON.parse(raw) as OrderMap) : {};
  } catch {
    return {};
  }
}

function saveOrderMap(map: OrderMap): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY.SHELF_ORDER, JSON.stringify(map));
}

/** Load fic data for shelf entries, with ordering support for drag-and-drop. */
export function useShelfFics(statusMap: Record<string, ReadingStatus>) {
  const [entries, setEntries] = useState<ShelfEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderMap, setOrderMap] = useState<OrderMap>(loadOrderMap);

  const resolve = useCallback(async () => {
    const ids = Object.keys(statusMap).filter((id) => statusMap[id] !== "none");
    if (ids.length === 0) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    const lookup = new Map<string, Fic>();

    const cached = getFicsCache();
    if (cached) {
      for (const fic of cached) lookup.set(fic.id, fic);
    }

    const missing = ids.filter((id) => !lookup.has(id));
    if (missing.length > 0) {
      const fetches = missing.map(async (id) => {
        try {
          const res = await fetch(`/api/fics/${id}`);
          if (res.ok) {
            const fic = (await res.json()) as Fic;
            lookup.set(fic.id, fic);
          }
        } catch {
        }
      });
      await Promise.all(fetches);
    }

    const result: ShelfEntry[] = [];
    for (const id of ids) {
      const fic = lookup.get(id);
      if (fic) {
        result.push({ fic, status: statusMap[id] });
      }
    }

    setEntries(result);
    setIsLoading(false);
  }, [statusMap]);

  useEffect(() => {
    void resolve();
  }, [resolve]);

  const ensureOrder = useCallback(
    (status: ReadingStatus, ficIds: string[]) => {
      setOrderMap((prev) => {
        const existing = prev[status];
        if (existing && existing.length > 0) {
          const idSet = new Set(ficIds);
          const synced = existing.filter((id) => idSet.has(id));
          for (const id of ficIds) {
            if (!synced.includes(id)) synced.push(id);
          }
          if (
            synced.length === existing.length &&
            synced.every((id, i) => id === existing[i])
          ) {
            return prev;
          }
          const next = { ...prev, [status]: synced };
          saveOrderMap(next);
          return next;
        }
        const next = { ...prev, [status]: ficIds };
        saveOrderMap(next);
        return next;
      });
    },
    [],
  );

  const sortEntries = useCallback(
    (status: ReadingStatus, items: ShelfEntry[]): ShelfEntry[] => {
      const order = orderMap[status];
      if (!order || order.length === 0) return items;

      const lookup = new Map(items.map((e) => [e.fic.id, e]));
      const sorted: ShelfEntry[] = [];

      for (const id of order) {
        const entry = lookup.get(id);
        if (entry) {
          sorted.push(entry);
          lookup.delete(id);
        }
      }
      for (const entry of lookup.values()) {
        sorted.push(entry);
      }
      return sorted;
    },
    [orderMap],
  );

  const reorder = useCallback(
    (status: ReadingStatus, activeId: string, overId: string) => {
      if (!overId || activeId === overId) return;

      setOrderMap((prev) => {
        const currentIds = prev[status] ?? [];
        const ids = [...currentIds];

        const activeIdx = ids.indexOf(activeId);
        const overIdx = ids.indexOf(overId);
        if (activeIdx === -1 || overIdx === -1) return prev;

        ids.splice(activeIdx, 1);
        ids.splice(overIdx, 0, activeId);

        const next = { ...prev, [status]: ids };
        saveOrderMap(next);
        return next;
      });
    },
    [],
  );

  return { entries, isLoading, sortEntries, reorder, ensureOrder };
}
