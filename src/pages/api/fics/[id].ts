import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { fics } from "@/db/schema";
import { dbFicToFic } from "@/lib/fic-transform";

export const GET:APIRoute = async({locals, params}) => {
  try {
    const id = params.id

    if(!id) {
      return new Response(JSON.stringify({error: 'Invalid ID'}), {
        status: 400,
        headers: { "Content-Type": "application/json"}
      })
    }
    const rows = await locals.db.select().from(fics).where(eq(fics.id, id))
    if(rows.length === 0) {
      return new Response(JSON.stringify({error: 'Fic not found'}), {
        status: 404, 
        headers: { "Content-Type": "application/json"}
      })
    }
    return new Response(JSON.stringify(dbFicToFic(rows[0])), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return new Response(JSON.stringify({error: message}), {
      headers: {"Content-Type": "application/json"},
      status: 500
    })
  }
}
