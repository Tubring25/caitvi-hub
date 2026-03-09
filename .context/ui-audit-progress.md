# UI Audit Progress — Immediate Fixes

**Branch:** `ui/audit-immediate-fixes`
**Started:** 2026-03-09

---

## ✅ Completed

- [x] **#1 Contrast fix**: `text-white/40` → `text-white/60~70` across 8 files (Footer, FilterBar, FicDiscovery, MeterBar, SearchBar, FicCardBack, discover.astro)
- [x] **#2 Contrast fix**: `text-gray-500` → `text-white/60`, `text-gray-300` → `text-white/80` in FicCardFront
- [x] **#13 Contrast fix**: MeterBar label `text-white/60` → `text-white/70`
- [x] **#3 Typography (fonts)**: Introduced Playfair Display (serif), Plus Jakarta Sans (sans), JetBrains Mono (mono) via Google Fonts in all 3 pages + configured `--font-sans/serif/mono` in global.css `@theme`
- [x] **#3 Typography (scale)**: Applied fluid `clamp()` sizing to all h1/h2 headings (index, discover, about, FicDiscovery). Added `font-serif` to index h1 and discover h1 for consistency.
- [x] **#4 Bug fix**: Header scroll `classList.remove('h-24')` → `'h-20'`
- [x] **#20 Cleanup**: Removed 2x `console.log` from Header.astro

---

## 🟡 Short-term — ✅ Completed

- [x] **#5 Distill**: Removed `backdrop-blur` from SearchBar and QuoteDisplay; kept on FicCard/MobileMenu/Header/About (justified uses)
- [x] **#6 Distill**: Removed gradient blur glow `motion.div` from FicCard hover; tilt/lift animation is sufficient
- [x] **#9 Harden**: Added `py-2 px-2 -mr-2 -mb-2` padding to FicCard flip button for 44px+ touch target
- [x] **#10 Harden**: Added ESC key listener + `role="dialog"` `aria-modal` to MobileMenu
- [x] **#8 Harden**: Added `aria-label` to nav elements (Header, Footer), section (FicDiscovery), input (SearchBar), buttons/links (FicCard front+back)
- [x] **#14 Distill**: Removed `font-mono` from non-data elements (author line, buttons, filter pills); kept on stats/meter labels
- [x] **#21 Normalize**: Assessed — NOT redundant; `getRatingBadge` uses distinct badge styling vs `RATING_CONFIG`. Added clarifying comment.
- [ ] **#11 Normalize**: Spacing scale — deferred, needs visual design review before safe changes

---

## 🟢 Medium-term — ✅ Low-risk items completed

- [x] **#12 Clarify**: Removed `text-center` from card grid wrapper; only title/empty state centered now
- [x] **#15 Optimize**: Added `will-change: transform` + `translateZ(0)` to background pseudo-elements for GPU compositing
- [x] **#16 Animate**: Added `prefers-reduced-motion: reduce` media query in global.css
- [x] **#17 Extract**: Created `FADE_IN_VIEW` motion preset constant in FicDiscovery, replaced 3 duplicate animation blocks
- [x] **#18 Optimize**: Replaced `window.innerWidth < 768` with `matchMedia("(pointer: coarse)")` in QuoteDisplay
- [x] **#22 Clarify**: Removed unused `.dark` variant block + `@custom-variant dark` from global.css

## 🔵 Remaining (Needs Design Decision)

- [ ] **#7 Clarify**: Home vs Discover page differentiation
- [ ] **#11 Normalize**: Unified spacing scale (needs visual review)
- [ ] **#19 Polish**: Footer redesign
