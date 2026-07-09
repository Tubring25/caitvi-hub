import type { Fic as DbFic } from "@/db/schema";
import { CONTENT_SIGNAL_CONFIG } from "@/types/fic";
import type { ContentSignal, Fic } from "@/types/fic";

function parseContentSignals(raw: string | null): ContentSignal[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((signal): signal is ContentSignal => (
      typeof signal === "string" && signal in CONTENT_SIGNAL_CONFIG
    ));
  } catch {
    return [];
  }
}

export function dbFicToFic(row: DbFic): Fic {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    summary: row.summary ?? "",
    rating: (row.rating as Fic["rating"]) ?? "G",
    tags: row.tagsJson ? JSON.parse(row.tagsJson) : [],
    category: row.category ?? "",
    status: row.status ?? "ongoing",
    isTranslated: row.isTranslated ?? false,
    state: {
      spice: row.baseSpice ?? 1,
      angst: row.baseAngst ?? 1,
      fluff: row.baseFluff ?? 1,
      plot: row.basePlot ?? 1,
      romance: row.baseRomance ?? 1,
    },
    stats: {
      words: row.words ?? 0,
      chapters: row.chapters ?? 1,
      kudos: row.kudos ?? 0,
      hits: row.hits ?? 0,
      comments: row.comments ?? 0,
      bookmarks: row.bookmarks ?? 0,
    },
    quote: row.quote ?? "",
    curatorNote: row.curatorNote ?? "",
    contentSignals: parseContentSignals(row.contentSignals),
    sourceLastCheckedAt: row.sourceLastCheckedAt ?? null,
    link: row.link,
  };
}
