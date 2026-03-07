import type { APIRoute } from "astro";
import { sql, gte } from "drizzle-orm";
import { fics } from "@/db/schema";
import { dbFicToFic } from "@/lib/fic-transform";

const MOOD_THRESHOLD = 4;

const MOOD_COLUMN = {
  fluff: fics.baseFluff,
  angst: fics.baseAngst,
  spicy: fics.baseSpice,
} as const;

type Mood = keyof typeof MOOD_COLUMN;

function isValidMood(value: string): value is Mood {
  return value in MOOD_COLUMN;
}

export const GET: APIRoute = async ({ locals, request }) => {
  try {
    const url = new URL(request.url);
    const moodParam = url.searchParams.get("mood");

    let query = locals.db.select().from(fics);

    if (moodParam && isValidMood(moodParam)) {
      query = query.where(gte(MOOD_COLUMN[moodParam], MOOD_THRESHOLD));
    }

    let rows = await query.orderBy(sql`RANDOM()`).limit(1);

    if (rows.length === 0 && moodParam) {
      rows = await locals.db
        .select()
        .from(fics)
        .orderBy(sql`RANDOM()`)
        .limit(1);
    }

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: "No fics found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(dbFicToFic(rows[0])), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
