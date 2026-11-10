import type { VoiceTone } from "@/types/work";

/**
 * Voice clips are addressed by convention rather than by a table:
 *
 *   Markdown   ["Cupcake."](voice:vi-01.mp3 "Vi")
 *   Public URL /audio/<work-slug>/<chapter-number>/vi-01.mp3
 *   R2 key     works/<work-slug>/<chapter-number>/vi-01.mp3
 *
 * tools/publish-work.mjs uploads with the same key layout.
 */

export const VOICE_LINK_PREFIX = "voice:";

const VOICE_FILE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*\.(mp3|m4a|aac|ogg|oga|opus|wav|webm)$/i;
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

const CONTENT_TYPES: Record<string, string> = {
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  aac: "audio/aac",
  ogg: "audio/ogg",
  oga: "audio/ogg",
  opus: "audio/ogg",
  wav: "audio/wav",
  webm: "audio/webm",
};

export function isVoiceFileName(name: string): boolean {
  return VOICE_FILE_PATTERN.test(name) && !name.includes("..");
}

export function isWorkSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

export function voiceContentType(fileName: string): string {
  const extension = fileName.slice(fileName.lastIndexOf(".") + 1).toLowerCase();
  return CONTENT_TYPES[extension] ?? "application/octet-stream";
}

export function voiceUrl(workSlug: string, chapterNumber: number, fileName: string): string {
  return `/audio/${workSlug}/${chapterNumber}/${fileName}`;
}

export function voiceObjectKey(workSlug: string, chapterNumber: number, fileName: string): string {
  return `works/${workSlug}/${chapterNumber}/${fileName}`;
}

export function speakerTone(speaker: string): VoiceTone {
  const name = speaker.trim().toLowerCase();
  if (name.startsWith("cait") || name.includes("凯特琳") || name.includes("凱特琳")) return "caitlyn";
  if (name === "vi" || name.startsWith("vi ") || name.startsWith("violet") || name === "蔚") return "vi";
  return "other";
}
