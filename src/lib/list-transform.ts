import type { CuratedList as DbCuratedList } from "@/db/schema";
import type { CoverMood, CuratedListSummary } from "@/types/list";

const VALID_MOODS: Set<string> = new Set(["warm", "dark", "soft", "intense", "wild"]);

function parseCoverMood(raw: string | null): CoverMood {
  if (raw && VALID_MOODS.has(raw)) return raw as CoverMood;
  return "dark";
}

export function dbListToSummary(
  row: DbCuratedList,
  ficCount: number,
): CuratedListSummary {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description ?? "",
    coverMood: parseCoverMood(row.coverMood),
    ficCount,
  };
}
