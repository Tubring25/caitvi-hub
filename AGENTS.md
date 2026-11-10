# AGENTS.md - Coding Guidelines for Caitvi Hub

## Project Overview

Caitvi Hub is an Astro + React + TypeScript web application with Tailwind CSS v4. It is a personal site with two parts: **Favorites** (lists of CaitVi fics the owner loves, linking to AO3) and **Writing** (the owner's own stories, with dialogue that can be played line by line). It is not a curated catalog: do not add discovery filters, rating signals, reading shelves or bulk AO3 features.

## Build & Development Commands

```bash
# Development server
pnpm dev

# Production build
pnpm build

# Preview production build
pnpm preview

# Astro CLI
pnpm astro [command]
```

**Note**: This project uses `pnpm` as the package manager (see `pnpm-lock.yaml`).

## Tech Stack

- **Framework**: Astro 5.x (server output, Cloudflare adapter)
- **UI Framework**: React 19.x with TypeScript
- **Styling**: Tailwind CSS v4 with CSS variables
- **Animation**: Motion (Framer Motion successor)
- **UI Components**: shadcn/ui (New York style)
- **Icons**: Lucide React
- **Database**: Cloudflare D1 (SQLite) via Drizzle ORM
- **Object storage**: Cloudflare R2 (`AUDIO` binding) for voice clips
- **Markdown**: `marked`, for chapters of the owner's stories
- **Path Alias**: `@/` maps to `./src/`

## Code Style Guidelines

### TypeScript

- Use strict TypeScript configuration (`astro/tsconfigs/strict`)
- Prefer `type` over `interface` for object shapes
- Use explicit return types for functions when not obvious
- Avoid `any` - use `unknown` with type guards instead

```typescript
// Good
export type ReadingStatus = "none" | "reading" | "completed" | "dropped";
export interface Fic { id: string; title: string; state: FicState; }
// Avoid
const data: any = fetchData();
```

### Imports

Order imports as follows:
1. React/ Astro imports
2. Third-party library imports
3. Internal `@/` alias imports
4. Relative imports
5. Type-only imports (use `import type`)

```typescript
import { useState, useRef } from "react";
import { motion, useMotionValue } from 'motion/react';
import { Slot } from "@radix-ui/react-slot";
import { FicCardFront } from "./FicCardFront";
import type { Fic, ReadingStatus } from "@/types/fic";
import { cn } from "@/lib/utils";
```

### Naming Conventions

- **Components**: PascalCase (e.g., `FicCard`, `QuoteDisplay`)
- **Hooks**: camelCase with `use` prefix (e.g., `useReadingStatus`, `useMediaQuery`)
- **Types/Interfaces**: PascalCase (e.g., `Fic`, `ReadingStatus`)
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Functions**: camelCase (e.g., `handleFlip`, `getStatus`)
- **Boolean props**: Use verb prefixes (e.g., `isFlipped`, `hasError`, `onStatusChange`)

### File Organization

```
src/
├── components/
│   ├── astro/          # Astro components (.astro)
│   ├── react/          # React components (.tsx)
│   │   └── VoicedChapter/  # Component with sub-components
│   └── ui/             # shadcn/ui components
├── db/                 # Drizzle schema
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── types/              # TypeScript types
├── pages/              # Astro pages (lists/, fic/, works/, audio/)
└── styles/             # global.css, editorial.css (light editorial pages)
tools/                  # Local Node scripts (publish-work.mjs)
scripts/                # Python AO3 ETL
manuscripts/            # Git-ignored: story text and voice clips
```

### React Components

- Use functional components with hooks
- Default exports for page/screen components
- Named exports for reusable UI components
- Props interface named `{ComponentName}Props`

```typescript
interface FicCardProps {
  fic: Fic;
  readingStatus?: ReadingStatus;
  onStatusChange?: (status: ReadingStatus) => void;
}
export default function FicCard({ fic, readingStatus = "none", onStatusChange }: FicCardProps) {
  // Component logic
}
```

### Styling with Tailwind

- Use Tailwind CSS v4 syntax with `@theme` and CSS variables
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Prefer composition over inline styles
- Use CSS variables for theme colors (defined in `src/styles/global.css`)

```tsx
// Good
className={cn(
  "inline-flex items-center justify-center",
  "rounded-md text-sm font-medium",
  "disabled:pointer-events-none disabled:opacity-50",
  className
)}
// Avoid
style={{ backgroundColor: 'red', padding: '10px' }}
```

### Error Handling & Animation

- Use React Error Boundaries for component-level errors
- Handle async errors with try/catch
- Use `motion/react` (not Framer Motion directly)
- Respect `prefers-reduced-motion` media query

### State Management

- Use React hooks (useState, useReducer) for local state
- Use custom hooks for reusable state logic
- There is no client-side persistence at the moment; add it only when a feature needs it

### Database (D1)

- SQL files should NOT include `BEGIN TRANSACTION` or `COMMIT` (D1 handles this)
- Use parameterized queries when possible
- Database ID is in `wrangler.toml`
- Schema is `src/db/schema.ts`; `pnpm db:generate` writes a migration to `drizzle/`, applied with `pnpm wrangler d1 execute caitvi-hub --local --file=drizzle/<file>.sql`
- Never run anything with `--remote` (D1 or R2) unless the owner asks for it in that session

### Owner's Stories and Voice Clips

- The repository is public. Story text and audio must never be committed: they live in `manuscripts/` (git-ignored) and reach D1 / R2 through `pnpm work:publish` (`tools/publish-work.mjs`)
- A voiced line is a Markdown link with a `voice:` target and the speaker as its title: `["Cupcake."](voice:vi-01.mp3 "Vi")`
- Clip URL `/audio/<slug>/<chapter>/<file>` maps to R2 key `works/<slug>/<chapter>/<file>` (see `src/lib/voice.ts`)
- Drafts render only in `pnpm dev` (`SHOW_DRAFTS` in `src/lib/works.ts`); every query and the audio route must keep that rule
- The local dev proxy can only pass plain data to bindings: give R2 plain objects, never a `Headers` instance

### Component Patterns

**shadcn/ui Components:**
- Located in `src/components/ui/`
- Use `cva` (class-variance-authority) for variant management
- Export both component and variant helper
- Use `@radix-ui` primitives as base

**Custom Components:**
- Co-locate sub-components in folders (e.g., `VoicedChapter/`)
- Index file exports main component
- Separate concerns (logic, presentation, animation)

## Environment Variables

Copy `.env.example` to `.env` and fill in:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `AO3_USERNAME`
- `AO3_PASSWORD`

## Notes for Agents

- This project has **no test framework** configured yet
- This project has **no ESLint/Prettier** configured yet
- When adding new shadcn components, follow the existing patterns in `src/components/ui/`
- The project uses **CSS variables** for theming (see `src/styles/global.css`)
- Path aliases are configured in `tsconfig.json` - always use `@/` for imports
- Python scripts in `/scripts` handle data ETL - don't modify without checking the pipeline
- There is no scheduled AO3 sync any more; `scripts/etl_pipeline.py` is only run by hand
- There is no type checker installed; `npx -y -p typescript tsc --noEmit` checks `.ts` / `.tsx` files
