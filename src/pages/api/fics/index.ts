import type { APIRoute } from "astro";
import { fics } from "@/db/schema";
import { dbFicToFic } from "@/lib/fic-transform";

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

    const rows = await locals.db.select().from(fics).limit(limit + 1).offset(offset);
    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;
    const items = pageRows.map(dbFicToFic);
    const nextOffset = offset + items.length;

    return new Response(
      JSON.stringify({
        items,
        hasMore,
        nextOffset,
      }),
      {
      status: 200,
      headers: { "Content-Type": "application/json" },
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
