import type { APIRoute } from "astro";
import { sql } from "drizzle-orm";
import { fics } from "@/db/schema";
import { dbFicToFic } from "@/lib/fic-transform";

export const GET: APIRoute = async ({ locals }) => {
  try {
    const rows = await locals.db
      .select()
      .from(fics)
      .orderBy(sql`RANDOM()`)
      .limit(1);

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
