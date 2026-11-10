#!/usr/bin/env node
/**
 * Publishes one of your own stories from a local manuscript folder into
 * Cloudflare D1 (text) and R2 (voice clips).
 *
 * Manuscripts are never committed: keep them under `manuscripts/`, which is
 * git-ignored, or anywhere else outside the repository.
 *
 *   pnpm work:publish manuscripts/<slug>             # local dev database
 *   pnpm work:publish manuscripts/<slug> --remote    # the live site
 *   pnpm work:publish manuscripts/<slug> --dry-run   # validate only
 *
 * Folder layout (the folder name is the URL slug):
 *
 *   manuscripts/<slug>/
 *     work.md               front matter + body (the body is the author's note)
 *     01-first-chapter.md   front matter + chapter text in Markdown
 *     02-second-chapter.md
 *     audio/01/vi-01.mp3    clips for chapter 1
 *
 * A voiced line is a Markdown link whose target starts with `voice:`:
 *
 *   ["You're hot, Cupcake."](voice:vi-01.mp3 "Vi")
 *
 * Flags:
 *   --remote    write to production instead of the local dev database
 *   --prune     also delete chapters and clips that are no longer in the folder
 *   --dry-run   validate and print the plan without writing anything
 *   --yes       skip the confirmation prompt for --remote
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WRANGLER = join(ROOT, "node_modules", ".bin", "wrangler");

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
const CHAPTER_FILE_PATTERN = /^(\d+)[-_ .].*\.md$|^(\d+)\.md$/;
const VOICE_FILE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*\.(mp3|m4a|aac|ogg|oga|opus|wav|webm)$/i;
const VOICE_LINK_PATTERN = /\]\(\s*voice:([^\s)]+)(?:\s+"[^"]*")?\s*\)/g;
const CONTENT_TYPES = {
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  aac: "audio/aac",
  ogg: "audio/ogg",
  oga: "audio/ogg",
  opus: "audio/ogg",
  wav: "audio/wav",
  webm: "audio/webm",
};
// D1 rejects statements over 100 KB, so long chapters are written in pieces.
const MAX_CHUNK_BYTES = 50_000;

class PublishError extends Error {}

function fail(message) {
  throw new PublishError(message);
}

function parseArgs(argv) {
  const flags = new Set(argv.filter((arg) => arg.startsWith("--")));
  const positional = argv.filter((arg) => !arg.startsWith("--"));
  const known = new Set(["--remote", "--prune", "--dry-run", "--yes", "--help"]);
  for (const flag of flags) if (!known.has(flag)) fail(`Unknown flag ${flag}`);
  return {
    folder: positional[0],
    isRemote: flags.has("--remote"),
    shouldPrune: flags.has("--prune"),
    isDryRun: flags.has("--dry-run"),
    skipConfirm: flags.has("--yes"),
    wantsHelp: flags.has("--help") || positional.length !== 1,
  };
}

/** Reads `key: value` front matter, including `|` block values and comma or [a, b] lists. */
function parseFrontMatter(source, label) {
  const text = source.replace(/^﻿/, "").replace(/\r\n/g, "\n");
  if (!text.startsWith("---\n")) return { data: {}, body: text.trim() };

  const end = text.indexOf("\n---", 4);
  if (end === -1) fail(`${label}: front matter is not closed with ---`);

  const data = {};
  const lines = text.slice(4, end).split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("#")) continue;

    const match = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line);
    if (!match) fail(`${label}: cannot read front matter line "${line}"`);
    const key = match[1];
    let value = match[2].trim();

    if (value === "|" || value === ">") {
      const block = [];
      while (i + 1 < lines.length && (/^\s+/.test(lines[i + 1]) || lines[i + 1] === "")) {
        i += 1;
        block.push(lines[i].replace(/^\s{1,4}/, ""));
      }
      data[key] = block.join(value === "|" ? "\n" : " ").trim();
      continue;
    }

    if (/^(["']).*\1$/.test(value)) value = value.slice(1, -1);
    data[key] = value;
  }

  return { data, body: text.slice(text.indexOf("\n", end + 1) + 1).trim() };
}

function parseList(value) {
  if (!value) return [];
  return value
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((item) => item.trim().replace(/^(["'])(.*)\1$/, "$2"))
    .filter(Boolean);
}

function pickEnum(value, allowed, fallback, label) {
  if (value === undefined || value === "") return fallback;
  if (!allowed.includes(value)) fail(`${label} must be one of: ${allowed.join(", ")} (got "${value}")`);
  return value;
}

/** CJK text is counted per character, everything else per word. */
function countWords(markdown) {
  const text = markdown
    .replace(/\]\([^)]*\)/g, "]")
    .replace(/[#>*_`~\[\]]/g, " ");
  const cjk = text.match(/[㐀-鿿豈-﫿぀-ヿ가-힯]/g)?.length ?? 0;
  const latin = text
    .replace(/[㐀-鿿豈-﫿぀-ヿ가-힯]/g, " ")
    .match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu)?.length ?? 0;
  return cjk + latin;
}

function findAudioFolder(folder, chapterNumber) {
  const candidates = [String(chapterNumber), String(chapterNumber).padStart(2, "0"), String(chapterNumber).padStart(3, "0")];
  for (const name of candidates) {
    const candidate = join(folder, "audio", name);
    if (existsSync(candidate) && statSync(candidate).isDirectory()) return candidate;
  }
  return null;
}

function readManuscript(folder) {
  if (!existsSync(folder) || !statSync(folder).isDirectory()) fail(`${folder} is not a folder`);

  const slug = basename(folder);
  if (!SLUG_PATTERN.test(slug)) {
    fail(`The folder name "${slug}" becomes the URL, so it may only use a-z, 0-9 and hyphens.`);
  }

  const workFile = join(folder, "work.md");
  if (!existsSync(workFile)) fail(`Missing ${workFile}`);
  const { data: meta, body: note } = parseFrontMatter(readFileSync(workFile, "utf8"), "work.md");
  if (!meta.title) fail("work.md needs a title");

  const work = {
    slug,
    title: meta.title,
    summary: meta.summary ?? "",
    note,
    lang: meta.lang || "en",
    rating: pickEnum(meta.rating, ["G", "T", "M", "E"], null, "work.md rating"),
    completion: pickEnum(meta.completion, ["ongoing", "completed"], "ongoing", "work.md completion"),
    status: pickEnum(meta.status, ["draft", "published"], "draft", "work.md status"),
    tags: parseList(meta.tags),
    ao3Link: meta.ao3 || null,
    sortOrder: Number.parseInt(meta.order ?? "0", 10) || 0,
  };
  if (work.ao3Link && !/^https:\/\//.test(work.ao3Link)) fail("work.md ao3 must be an https:// link");

  const warnings = [];
  const chapters = [];
  const clips = [];

  const chapterFiles = readdirSync(folder)
    .filter((name) => name !== "work.md" && CHAPTER_FILE_PATTERN.test(name))
    .sort();

  for (const fileName of chapterFiles) {
    const match = CHAPTER_FILE_PATTERN.exec(fileName);
    const number = Number.parseInt(match[1] ?? match[2], 10);
    if (number < 1) fail(`${fileName}: chapter numbers start at 1`);
    if (chapters.some((chapter) => chapter.number === number)) fail(`Two files claim chapter ${number}`);

    const { data, body } = parseFrontMatter(readFileSync(join(folder, fileName), "utf8"), fileName);
    if (!body) fail(`${fileName} has no text`);

    const referenced = [...body.matchAll(VOICE_LINK_PATTERN)].map((link) => link[1]);
    const audioFolder = findAudioFolder(folder, number);
    const available = audioFolder ? readdirSync(audioFolder).filter((name) => !name.startsWith(".")) : [];

    for (const clip of new Set(referenced)) {
      if (!VOICE_FILE_PATTERN.test(clip)) {
        fail(`${fileName}: "${clip}" is not a usable clip name (letters, digits, . _ - and an audio extension)`);
      }
      if (!available.includes(clip)) {
        fail(`${fileName}: voice clip "${clip}" was not found in audio/${String(number).padStart(2, "0")}/`);
      }
      clips.push({
        key: `works/${slug}/${number}/${clip}`,
        file: join(audioFolder, clip),
        contentType: CONTENT_TYPES[clip.split(".").pop().toLowerCase()],
      });
    }
    for (const name of available) {
      if (!referenced.includes(name)) warnings.push(`audio for chapter ${number}: ${name} is not used by any line`);
    }

    chapters.push({
      number,
      fileName,
      title: data.title || `Chapter ${number}`,
      status: pickEnum(data.status, ["draft", "published"], "draft", `${fileName} status`),
      body,
      words: countWords(body),
      voiceCount: referenced.length,
    });
  }

  if (chapters.length === 0) fail("No chapter files found. Name them like 01-title.md");
  chapters.sort((a, b) => a.number - b.number);
  return { work, chapters, clips, warnings };
}

const sqlText = (value) => (value === null || value === undefined ? "NULL" : `'${String(value).replace(/'/g, "''")}'`);

function splitByBytes(text, maxBytes) {
  const chunks = [];
  let current = "";
  let currentBytes = 0;
  // Iterating by code point keeps surrogate pairs (emoji, rare CJK) intact.
  for (const character of text) {
    const size = Buffer.byteLength(character);
    if (currentBytes + size > maxBytes && current) {
      chunks.push(current);
      current = "";
      currentBytes = 0;
    }
    current += character;
    currentBytes += size;
  }
  if (current) chunks.push(current);
  return chunks;
}

function buildSql({ work, chapters }, shouldPrune) {
  const statements = [];
  const publishedAt = (status) => (status === "published" ? "unixepoch()" : "NULL");

  statements.push(
    `INSERT INTO works (slug, title, summary, note, lang, rating, completion, status, tags_json, ao3_link, sort_order, published_at, created_at, updated_at)
VALUES (${sqlText(work.slug)}, ${sqlText(work.title)}, ${sqlText(work.summary)}, ${sqlText(work.note)}, ${sqlText(work.lang)}, ${sqlText(work.rating)}, ${sqlText(work.completion)}, ${sqlText(work.status)}, ${sqlText(JSON.stringify(work.tags))}, ${sqlText(work.ao3Link)}, ${work.sortOrder}, ${publishedAt(work.status)}, unixepoch(), unixepoch())
ON CONFLICT(slug) DO UPDATE SET
  title = excluded.title, summary = excluded.summary, note = excluded.note, lang = excluded.lang,
  rating = excluded.rating, completion = excluded.completion, status = excluded.status,
  tags_json = excluded.tags_json, ao3_link = excluded.ao3_link, sort_order = excluded.sort_order,
  published_at = COALESCE(works.published_at, excluded.published_at), updated_at = unixepoch();`,
  );

  for (const chapter of chapters) {
    const [first, ...rest] = splitByBytes(chapter.body, MAX_CHUNK_BYTES);
    // A chapter written in several pieces stays hidden until the last piece
    // lands, so readers never see half a chapter.
    const interimStatus = rest.length > 0 ? "draft" : chapter.status;
    const where = `work_slug = ${sqlText(work.slug)} AND number = ${chapter.number}`;

    statements.push(
      `INSERT INTO work_chapters (work_slug, number, title, body, words, voice_count, status, published_at, updated_at)
VALUES (${sqlText(work.slug)}, ${chapter.number}, ${sqlText(chapter.title)}, ${sqlText(first)}, ${chapter.words}, ${chapter.voiceCount}, ${sqlText(interimStatus)}, ${publishedAt(chapter.status)}, unixepoch())
ON CONFLICT(work_slug, number) DO UPDATE SET
  title = excluded.title, body = excluded.body, words = excluded.words, voice_count = excluded.voice_count,
  status = excluded.status, published_at = COALESCE(work_chapters.published_at, excluded.published_at),
  updated_at = unixepoch();`,
    );
    for (const chunk of rest) {
      statements.push(`UPDATE work_chapters SET body = body || ${sqlText(chunk)} WHERE ${where};`);
    }
    if (rest.length > 0) {
      statements.push(`UPDATE work_chapters SET status = ${sqlText(chapter.status)} WHERE ${where};`);
    }
  }

  if (shouldPrune) {
    const kept = chapters.map((chapter) => chapter.number).join(", ");
    statements.push(`DELETE FROM work_chapters WHERE work_slug = ${sqlText(work.slug)} AND number NOT IN (${kept});`);
  }

  return `${statements.join("\n\n")}\n`;
}

function readBindings() {
  const toml = readFileSync(join(ROOT, "wrangler.toml"), "utf8");
  const database = /database_name\s*=\s*"([^"]+)"/.exec(toml)?.[1];
  const bucket = /bucket_name\s*=\s*"([^"]+)"/.exec(toml)?.[1];
  if (!database || !bucket) fail("wrangler.toml needs both a D1 database_name and an R2 bucket_name");
  return { database, bucket };
}

function wrangler(args) {
  const result = spawnSync(WRANGLER, args, { cwd: ROOT, encoding: "utf8" });
  if (result.error) fail(`Could not run wrangler: ${result.error.message}`);
  if (result.status !== 0) {
    fail(`wrangler ${args.slice(0, 3).join(" ")} failed:\n${(result.stderr || result.stdout).trim()}`);
  }
}

function hashFile(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

async function confirmRemote(work, chapters) {
  const live = chapters.filter((chapter) => chapter.status === "published").length;
  console.log(
    work.status === "published"
      ? `\nThis writes to the LIVE site: "${work.title}" with ${live} published chapter(s) will be public.`
      : `\nThis writes to the live database, but "${work.title}" is a draft and stays hidden.`,
  );
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await prompt.question("Continue? (y/N) ");
  prompt.close();
  return /^y(es)?$/i.test(answer.trim());
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.wantsHelp) {
    console.log("Usage: pnpm work:publish <manuscript-folder> [--remote] [--prune] [--dry-run] [--yes]");
    process.exitCode = options.folder ? 0 : 1;
    return;
  }

  const folder = resolve(options.folder);
  const manuscript = readManuscript(folder);
  const { work, chapters, clips, warnings } = manuscript;
  const target = options.isRemote ? "remote" : "local";

  console.log(`\n${work.title}  (/works/${work.slug})  —  ${work.status}`);
  for (const chapter of chapters) {
    const voiced = chapter.voiceCount > 0 ? `, ${chapter.voiceCount} voiced` : "";
    console.log(`  ${String(chapter.number).padStart(2, "0")}  ${chapter.title}  [${chapter.status}]  ${chapter.words} words${voiced}`);
  }
  for (const warning of warnings) console.log(`  note: ${warning}`);

  if (options.isDryRun) {
    console.log(`\nDry run: nothing written. ${clips.length} clip(s) would be checked against ${target}.`);
    return;
  }
  if (options.isRemote && !options.skipConfirm && !(await confirmRemote(work, chapters))) {
    console.log("Cancelled.");
    return;
  }

  const { database, bucket } = readBindings();
  const targetFlag = options.isRemote ? "--remote" : "--local";

  // Clips go first so a chapter never points at audio that is not there yet.
  const manifestFile = join(folder, `.published-${target}.json`);
  const manifest = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, "utf8")) : {};
  const nextManifest = {};
  let uploaded = 0;
  for (const clip of clips) {
    const hash = hashFile(clip.file);
    if (manifest[clip.key] !== hash) {
      wrangler(["r2", "object", "put", `${bucket}/${clip.key}`, "--file", clip.file, "--content-type", clip.contentType, targetFlag]);
      uploaded += 1;
      console.log(`  uploaded ${clip.key}`);
    }
    nextManifest[clip.key] = hash;
  }

  const stale = Object.keys(manifest).filter((key) => !(key in nextManifest));
  for (const key of stale) {
    if (options.shouldPrune) {
      wrangler(["r2", "object", "delete", `${bucket}/${key}`, targetFlag]);
      console.log(`  deleted ${key}`);
    } else {
      nextManifest[key] = manifest[key];
      console.log(`  note: ${key} is no longer used (run with --prune to delete it)`);
    }
  }
  writeFileSync(manifestFile, `${JSON.stringify(nextManifest, null, 2)}\n`);

  // The SQL holds the full manuscript, so it lives in a private temp folder and is removed afterwards.
  const scratch = mkdtempSync(join(tmpdir(), "caitvi-publish-"));
  try {
    const sqlFile = join(scratch, "publish.sql");
    writeFileSync(sqlFile, buildSql(manuscript, options.shouldPrune), { mode: 0o600 });
    wrangler(["d1", "execute", database, targetFlag, "--file", sqlFile, "--yes"]);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }

  console.log(`\nDone (${target}): ${chapters.length} chapter(s) written, ${uploaded} clip(s) uploaded, ${clips.length - uploaded} unchanged.`);
  if (!options.isRemote) console.log(`Preview with pnpm dev at /works/${work.slug} — drafts are visible locally only.`);
}

main().catch((error) => {
  if (error instanceof PublishError) {
    console.error(`\nCannot publish: ${error.message}`);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});
