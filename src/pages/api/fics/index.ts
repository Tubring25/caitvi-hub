import type { APIRoute } from "astro";
import { and, or, inArray, gte, lte, desc, sql } from "drizzle-orm";
import { fics } from "@/db/schema";
import { dbFicToFic } from "@/lib/fic-transform";
import { parseFilterParams, escapeLike } from "@/lib/filter-utils";
import { curatedRecordCondition } from "@/lib/curated-records";

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 60;

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) return fallback;
  return parsed;
}

export const GET: APIRoute = async ({ locals, request }) => {
  try {
    const url = new URL(request.url);
    const rawLimit = parsePositiveInt(url.searchParams.get("limit"), DEFAULT_LIMIT);
    const limit = Math.min(Math.max(rawLimit, 1), MAX_LIMIT);
    const offset = parsePositiveInt(url.searchParams.get("offset"), 0);

    const params = parseFilterParams(url);

    const conditions = [curatedRecordCondition()];

    if (params.q) {
      const pattern = `%${escapeLike(params.q)}%`;
      conditions.push(
        or(
          sql`${fics.title} LIKE ${pattern} ESCAPE '\\'`,
          sql`${fics.author} LIKE ${pattern} ESCAPE '\\'`,
        )
      );
    }

    if (params.vibes && params.vibes.length > 0) {
      const vibeColumn = {
        spice: fics.baseSpice,
        angst: fics.baseAngst,
        fluff: fics.baseFluff,
        plot: fics.basePlot,
        romance: fics.baseRomance,
      } as const;
      conditions.push(or(...params.vibes.map((vibe) => gte(vibeColumn[vibe], 4))));
    }

    if (params.signals && params.signals.length > 0) {
      conditions.push(or(...params.signals.map((signal) => {
        const pattern = `%"${escapeLike(signal)}"%`;
        return sql`${fics.contentSignals} LIKE ${pattern} ESCAPE '\\'`;
      })));
    }

    if (params.ratings && params.ratings.length > 0) {
      conditions.push(inArray(fics.rating, params.ratings));
    }

    if (params.minWords !== undefined) {
      conditions.push(gte(fics.words, params.minWords));
    }

    if (params.maxWords !== undefined) {
      conditions.push(lte(fics.words, params.maxWords));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let total: number | undefined;
    if (offset === 0) {
      const countResult = await locals.db
        .select({ count: sql<number>`count(*)` })
        .from(fics)
        .where(whereClause);
      total = countResult[0]?.count ?? 0;
    }

    const rows = await locals.db
      .select()
      .from(fics)
      .where(whereClause)
      .orderBy(desc(fics.createdAt), desc(fics.id))
      .limit(limit + 1)
      .offset(offset);

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;
    const items = pageRows.map(dbFicToFic);
    const nextOffset = offset + items.length;

    return new Response(
      JSON.stringify({
        items,
        total,
        hasMore,
        nextOffset,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60",
        },
      },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
