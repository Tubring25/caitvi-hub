import type { APIRoute } from "astro";
import { and, or, eq, inArray, gte, lte, desc, asc, sql } from "drizzle-orm";
import { fics } from "@/db/schema";
import { dbFicToFic } from "@/lib/fic-transform";
import { parseFilterParams, escapeLike } from "@/lib/filter-utils";
import type { SortOption } from "@/types/filters";

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 60;

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) return fallback;
  return parsed;
}

function getOrderClauses(sort: SortOption) {
  switch (sort) {
    case 'kudos':
      return [desc(fics.kudos), desc(fics.id)];
    case 'words_desc':
      return [desc(fics.words), desc(fics.id)];
    case 'words_asc':
      return [asc(fics.words), asc(fics.id)];
    default:
      return [desc(fics.createdAt), desc(fics.id)];
  }
}

export const GET: APIRoute = async ({ locals, request }) => {
  try {
    const url = new URL(request.url);
    const rawLimit = parsePositiveInt(url.searchParams.get("limit"), DEFAULT_LIMIT);
    const limit = Math.min(Math.max(rawLimit, 1), MAX_LIMIT);
    const offset = parsePositiveInt(url.searchParams.get("offset"), 0);

    const params = parseFilterParams(url);

    const conditions = [];

    if (params.q) {
      const pattern = `%${escapeLike(params.q)}%`;
      conditions.push(
        or(
          sql`${fics.title} LIKE ${pattern} ESCAPE '\\'`,
          sql`${fics.author} LIKE ${pattern} ESCAPE '\\'`,
          sql`${fics.tagsJson} LIKE ${pattern} ESCAPE '\\'`,
        )
      );
    }

    if (params.ratings && params.ratings.length > 0) {
      conditions.push(inArray(fics.rating, params.ratings));
    }

    if (params.status) {
      conditions.push(eq(fics.status, params.status));
    }

    if (params.minWords !== undefined) {
      conditions.push(gte(fics.words, params.minWords));
    }

    if (params.maxWords !== undefined) {
      conditions.push(lte(fics.words, params.maxWords));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const orderClauses = getOrderClauses(params.sort);

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
      .orderBy(...orderClauses)
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
