import { getReadingStatusMap, setReadingStatus as saveStatus } from "@/lib/storage";
import type { ReadingStatus } from "@/types/fic";
import { useState, useEffect, useCallback } from "react";

export const useReadingStatus = () => {
  const [statusMap, setStatusMap] = useState<Record<string, ReadingStatus>>({});

  useEffect(() => {
    setStatusMap(getReadingStatusMap())
  }, []);

  const getStatus = useCallback((ficId: string): ReadingStatus => {
    return statusMap[ficId] ?? 'none';
  }, [statusMap])

  const updateStatus = useCallback((ficId: string, status: ReadingStatus) => {
    saveStatus(ficId, status);
    setStatusMap((prev) => {
      const next = {...prev};
      if(status === 'none') {
        delete next[ficId];
      } else {
        next[ficId] = status;
      }
      return next;
    })
  }, []);

  return { statusMap, getStatus, updateStatus };
}