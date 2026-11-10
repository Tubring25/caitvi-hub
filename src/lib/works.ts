import { and, asc, desc, eq, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

import { workChapters, works } from "@/db/schema";
import type { Work as DbWork, WorkChapter as DbWorkChapter } from "@/db/schema";
import type { ChapterDetail, ChapterSummary, WorkSummary } from "@/types/work";

type WorkTotals = {
  chapterCount: number;
  words: number;
  voiceCount: number;
};

/**
 * Drafts are only ever shown by the local dev server, so a chapter can be
 * previewed before it is published. Production never renders them.
 */
export const SHOW_DRAFTS: boolean = import.meta.env.DEV;

function parseTags(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === "string") : [];
  } catch {
    return [];
  }
}

function toWorkSummary(row: DbWork, totals: WorkTotals): WorkSummary {
  return {
    slug: row.slug,
    title: row.title,
    summary: row.summary ?? "",
    note: row.note ?? "",
    lang: row.lang,
    rating: row.rating ?? null,
    completion: row.completion,
    status: row.status,
    tags: parseTags(row.tagsJson),
    ao3Link: row.ao3Link ?? null,
    publishedAt: row.publishedAt ? row.publishedAt.getTime() : null,
    ...totals,
  };
}

function toChapterSummary(row: Pick<DbWorkChapter, "number" | "title" | "words" | "voiceCount" | "status">): ChapterSummary {
  return {
    number: row.number,
    title: row.title,
    words: row.words,
    voiceCount: row.voiceCount,
    status: row.status,
  };
}

function sumChapters(chapters: ChapterSummary[]): WorkTotals {
  return {
    chapterCount: chapters.length,
    words: chapters.reduce((total, chapter) => total + chapter.words, 0),
    voiceCount: chapters.reduce((total, chapter) => total + chapter.voiceCount, 0),
  };
}

export async function listWorks(db: DrizzleD1Database): Promise<WorkSummary[]> {
  const chapterVisible = SHOW_DRAFTS ? sql`1 = 1` : eq(workChapters.status, "published");

  const rows = await db
    .select({
      work: works,
      chapterCount: sql<number>`count(${workChapters.number})`,
      words: sql<number>`coalesce(sum(${workChapters.words}), 0)`,
      voiceCount: sql<number>`coalesce(sum(${workChapters.voiceCount}), 0)`,
    })
    .from(works)
    .leftJoin(workChapters, and(eq(workChapters.workSlug, works.slug), chapterVisible))
    .where(SHOW_DRAFTS ? undefined : eq(works.status, "published"))
    .groupBy(works.slug)
    .orderBy(asc(works.sortOrder), desc(works.publishedAt));

  return rows.map((row) =>
    toWorkSummary(row.work, {
      chapterCount: row.chapterCount,
      words: row.words,
      voiceCount: row.voiceCount,
    }),
  );
}

export async function getWork(
  db: DrizzleD1Database,
  slug: string,
): Promise<{ work: WorkSummary; chapters: ChapterSummary[] } | null> {
  const workRows = await db
    .select()
    .from(works)
    .where(SHOW_DRAFTS ? eq(works.slug, slug) : and(eq(works.slug, slug), eq(works.status, "published")));
  if (workRows.length === 0) return null;

  const chapterRows = await db
    .select({
      number: workChapters.number,
      title: workChapters.title,
      words: workChapters.words,
      voiceCount: workChapters.voiceCount,
      status: workChapters.status,
    })
    .from(workChapters)
    .where(
      SHOW_DRAFTS
        ? eq(workChapters.workSlug, slug)
        : and(eq(workChapters.workSlug, slug), eq(workChapters.status, "published")),
    )
    .orderBy(asc(workChapters.number));

  const chapters = chapterRows.map(toChapterSummary);
  return { work: toWorkSummary(workRows[0], sumChapters(chapters)), chapters };
}

export async function getChapter(
  db: DrizzleD1Database,
  slug: string,
  chapterNumber: number,
): Promise<{ work: WorkSummary; chapters: ChapterSummary[]; chapter: ChapterDetail } | null> {
  const found = await getWork(db, slug);
  if (!found) return null;
  if (!found.chapters.some((chapter) => chapter.number === chapterNumber)) return null;

  const rows = await db
    .select()
    .from(workChapters)
    .where(and(eq(workChapters.workSlug, slug), eq(workChapters.number, chapterNumber)));
  if (rows.length === 0) return null;

  return {
    ...found,
    chapter: { ...toChapterSummary(rows[0]), body: rows[0].body },
  };
}

/** True when a chapter is live, i.e. its voice clips may be served to anyone. */
export async function isChapterPublic(
  db: DrizzleD1Database,
  slug: string,
  chapterNumber: number,
): Promise<boolean> {
  const rows = await db
    .select({ number: workChapters.number })
    .from(workChapters)
    .innerJoin(works, eq(works.slug, workChapters.workSlug))
    .where(
      and(
        eq(workChapters.workSlug, slug),
        eq(workChapters.number, chapterNumber),
        SHOW_DRAFTS ? undefined : eq(workChapters.status, "published"),
        SHOW_DRAFTS ? undefined : eq(works.status, "published"),
      ),
    )
    .limit(1);
  return rows.length > 0;
}

export function formatWordCount(words: number, lang: string): string {
  const unit = lang.startsWith("zh") ? "字" : words === 1 ? "word" : "words";
  const separator = lang.startsWith("zh") ? "" : " ";
  if (words < 1_000) return `${words}${separator}${unit}`;
  return `${(words / 1_000).toFixed(words >= 10_000 ? 0 : 1).replace(/\.0$/, "")}k${separator}${unit}`;
}

export function formatReadTime(words: number, lang: string): string {
  // CJK prose is counted per character, and reads at roughly 400 characters a minute.
  const perMinute = lang.startsWith("zh") ? 400 : 250;
  const minutes = Math.max(1, Math.ceil(words / perMinute));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours} hr` : `${hours} hr ${remainder} min`;
}
