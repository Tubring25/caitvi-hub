import type { APIRoute } from "astro";

import { isVoiceFileName, isWorkSlug, voiceContentType, voiceObjectKey } from "@/lib/voice";
import { SHOW_DRAFTS, isChapterPublic } from "@/lib/works";

type ClipRange = { offset: number; length?: number } | { suffix: number };

const notFound = (): Response => new Response("Not found", { status: 404 });

/**
 * Turns a `Range` header into the plain object R2 expects. Handing R2 the
 * request's own Headers works on Cloudflare but not through the local dev
 * proxy, which can only pass plain data. Multi-range requests fall back to
 * the whole clip.
 */
function parseRange(header: string | null): ClipRange | undefined {
  const match = header ? /^bytes=(\d*)-(\d*)$/.exec(header.trim()) : null;
  if (!match) return undefined;
  const [, first, last] = match;
  if (first === "") return last === "" ? undefined : { suffix: Number(last) };
  const offset = Number(first);
  if (last === "") return { offset };
  const end = Number(last);
  return end < offset ? undefined : { offset, length: end - offset + 1 };
}

/** Reads a single entity tag out of `If-None-Match`; anything fancier is ignored. */
function parseIfNoneMatch(header: string | null): string | undefined {
  const match = header ? /^(?:W\/)?"([^"]+)"$/.exec(header.trim()) : null;
  return match?.[1];
}

/**
 * Streams a voice clip out of R2.
 *
 * Clips are only served for chapters that are published, so audio for a draft
 * cannot be fetched by guessing its URL. Range requests are honoured because
 * Safari will not play audio from a server that ignores them.
 */
export const GET: APIRoute = async ({ params, request, locals }) => {
  const slug = params.slug ?? "";
  const file = params.file ?? "";
  const chapterNumber = Number(params.chapter);

  if (!isWorkSlug(slug) || !isVoiceFileName(file)) return notFound();
  if (!Number.isInteger(chapterNumber) || chapterNumber < 1) return notFound();
  if (!(await isChapterPublic(locals.db, slug, chapterNumber))) return notFound();

  const bucket = locals.runtime.env.AUDIO;
  const key = voiceObjectKey(slug, chapterNumber, file);

  const range = parseRange(request.headers.get("range"));
  const etag = parseIfNoneMatch(request.headers.get("if-none-match"));

  let object: Awaited<ReturnType<typeof bucket.get>>;
  try {
    object = await bucket.get(key, {
      ...(range ? { range } : {}),
      ...(etag ? { onlyIf: { etagDoesNotMatch: etag } } : {}),
    });
  } catch (error) {
    // R2 rejects a range that starts past the end of the clip.
    if (range) return new Response("Requested range not satisfiable", { status: 416 });
    throw error;
  }
  if (!object) return notFound();

  // Metadata is read field by field, not with writeHttpMetadata(headers), for the
  // same reason as parseRange: the local dev proxy cannot pass a Headers object.
  const headers = new Headers();
  headers.set("content-type", object.httpMetadata?.contentType ?? voiceContentType(file));
  headers.set("etag", object.httpEtag);
  headers.set("accept-ranges", "bytes");
  // Drafts previewed locally change often; published clips are safe to cache.
  headers.set("cache-control", SHOW_DRAFTS ? "no-store" : "public, max-age=86400");

  // A conditional request that matched returns metadata only.
  if (!("body" in object)) return new Response(null, { status: 304, headers });

  const served = object.range;
  if (range && served) {
    const size = object.size;
    let start = 0;
    let length = size;
    if ("suffix" in served) {
      length = Math.min(served.suffix, size);
      start = size - length;
    } else {
      start = served.offset ?? 0;
      length = Math.min(served.length ?? size - start, size - start);
    }
    headers.set("content-range", `bytes ${start}-${start + length - 1}/${size}`);
    headers.set("content-length", String(length));
    return new Response(object.body, { status: 206, headers });
  }

  headers.set("content-length", String(object.size));
  return new Response(object.body, { status: 200, headers });
};
