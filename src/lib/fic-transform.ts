import type { Fic as DbFic } from "@/db/schema";
import type { Fic } from "@/types/fic";

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
    link: row.link,
  };
}
