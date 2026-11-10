# Caitvi Hub

Caitvi Hub is a personal CaitVi fan fiction site built with Astro, React, TypeScript, Tailwind CSS, Cloudflare D1 and R2.

It does two things:

- **Favorites** — the fics I keep coming back to, grouped into lists, each linking back to AO3.
- **Writing** — my own stories, published here in full, with dialogue that can be played line by line where a chapter has voice clips.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Cover page with entries to Favorites and Writing |
| `/lists` | Favorites, grouped into lists |
| `/lists/[slug]` | One favorites list |
| `/fic/[id]` | Detail page for a favorite, linking to AO3 |
| `/works` | Index of my own stories |
| `/works/[slug]` | Title page and chapter list for one story |
| `/works/[slug]/[chapter]` | Chapter reader with the voiced-line player |
| `/audio/[slug]/[chapter]/[file]` | Streams a voice clip from R2 (published chapters only) |
| `/about` | Site context |

## Commands

```sh
pnpm install
pnpm dev
pnpm build
pnpm preview
```

Database schema lives in `src/db/schema.ts`. Generate a migration with `pnpm db:generate`, then apply the new SQL file:

```sh
pnpm wrangler d1 execute caitvi-hub --local --file=drizzle/<migration>.sql
pnpm wrangler d1 execute caitvi-hub --remote --file=drizzle/<migration>.sql
```

## Publishing a story

Story text and voice clips are **not** stored in this repository. They live in a local manuscript folder (`manuscripts/` is git-ignored) and are pushed to D1 (text) and R2 (audio) by a script.

```
manuscripts/<slug>/            the folder name is the URL slug
  work.md                      front matter + body (the body is the author's note)
  01-first-chapter.md          front matter + chapter text in Markdown
  02-second-chapter.md
  audio/01/vi-01.mp3           clips for chapter 1
```

`work.md` front matter (only `title` is required; keep each value on its own line, without trailing comments):

```yaml
---
title: Story title
summary: One or two sentences for the index.
lang: en
rating: T
completion: ongoing
status: draft
tags: [slow burn, post-canon]
ao3: https://archiveofourown.org/works/...
order: 0
---
```

| Key | Values |
| --- | --- |
| `lang` | `en` (default) or `zh` |
| `rating` | `G`, `T`, `M` or `E` |
| `completion` | `ongoing` (default) or `completed` |
| `status` | `draft` (default) or `published` |
| `ao3` | optional `https://` link shown as "Also on AO3" |
| `order` | optional; lower numbers sort first |

Chapter files take `title` and `status` (`draft` or `published`).

A voiced line is an ordinary Markdown link whose target starts with `voice:`; the link title is the speaker:

```markdown
["You're hot, Cupcake."](voice:vi-01.mp3 "Vi")
```

Supported clip formats: mp3, m4a, aac, ogg, opus, wav, webm.

```sh
pnpm work:publish manuscripts/<slug> --dry-run   # validate only
pnpm work:publish manuscripts/<slug>             # local dev database and bucket
pnpm work:publish manuscripts/<slug> --remote    # the live site (asks first)
```

Add `--prune` to also remove chapters and clips that are no longer in the folder.

Drafts — a work or a chapter with `status: draft` — are only rendered by `pnpm dev`. The deployed site shows published works and chapters only, and does not serve audio for anything else.

### One-time setup for the live site

```sh
pnpm wrangler r2 bucket create caitvi-hub-audio
pnpm wrangler d1 execute caitvi-hub --remote --file=drizzle/0003_salty_iron_fist.sql
```

## Stack

- Astro 5 (server output, Cloudflare adapter)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui style components
- Drizzle ORM
- Cloudflare D1, R2 and Workers
- `marked` for chapter Markdown

## Environment

Copy `.env.example` to `.env` and fill in the required Cloudflare and AO3 values when running data or deployment workflows.
