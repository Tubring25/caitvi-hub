import type { Fic } from "./fic";

export type CoverMood = "warm" | "dark" | "soft" | "intense" | "wild";

export interface CuratedListSummary {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverMood: CoverMood;
  ficCount: number;
}

export interface CuratedListDetail extends CuratedListSummary {
  items: CuratedListItem[];
}

export interface CuratedListItem {
  fic: Fic;
  curatorComment?: string;
  sortOrder: number;
}
