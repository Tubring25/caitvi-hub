import type { Fic, ReadingStatus } from "@/types/fic";

interface ReadingStatusMap {
  [ficId: string]: ReadingStatus;
}

interface FicsCache {
  data: Fic[];
  updateAt: number;
}

const STORAGE_KEY = {
  REDIRECT_STATUS: 'caitvi-reading-status',
  FICS_CACHE: 'caitvi-fics-cache',
} as const;

export const getReadingStatusMap = ():ReadingStatusMap => {
  if(typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY.REDIRECT_STATUS);
    return raw ? JSON.parse(raw) : {}
  } catch (error) {
    console.error('Error parsing reading status map:', error);
    return {};
  }
}

export const getReadingStatus = (ficId: string): ReadingStatus => {
  const map = getReadingStatusMap();
  return map[ficId] ?? 'none';
}

export const setReadingStatus = (ficId: string, status: ReadingStatus): void => {
  const map = getReadingStatusMap();
  map[ficId] = status;
  localStorage.setItem(STORAGE_KEY.REDIRECT_STATUS, JSON.stringify(map));
}

export const getFicsCache = (): Fic[] | null => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY.FICS_CACHE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {data: Fic[], updateAt: number };
    const ONE_DAY = 24 * 60 * 60 * 1000;
    if(Date.now() - parsed.updateAt > ONE_DAY) return null;
    return parsed.data;
  } catch (error) {
    console.error('Error parsing fics cache:', error);
    return null;
  }
}

export const setFicsCache = (data: Fic[]): void => {
  if (typeof window === 'undefined') return;
  try {
    const cache = {
      data,
      updateAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY.FICS_CACHE, JSON.stringify(cache));
  } catch (error) {
    console.error('Error setting fics cache:', error);
  }
}

export const clearFicsCache = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY.FICS_CACHE);
}