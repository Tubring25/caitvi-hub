import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  FileSearch,
  Loader2,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { usePaginatedFics } from "@/hooks/use-paginated-fics";
import { cn } from "@/lib/utils";
import { WORD_COUNT_RANGES } from "@/types/filters";
import type { Fic, Rating } from "@/types/fic";
import type { FilterState, WordCountBucket } from "@/types/filters";

type LengthFilter = Exclude<WordCountBucket, "any">;
type StatusFilter = Fic["status"];

const PAGE_SIZE = 60;
const RATINGS: Rating[] = ["G", "T", "M", "E"];
const LENGTHS: LengthFilter[] = ["short", "medium", "long", "epic", "legendary"];
const STATUSES: StatusFilter[] = ["completed", "ongoing"];

const STATUS_LABELS: Record<StatusFilter, string> = {
  completed: "Complete",
  ongoing: "Ongoing",
};

const ACCENT_CLASSES = [
  "bg-[var(--catalog-yellow)]",
  "bg-[var(--catalog-pink)]",
  "bg-[var(--catalog-blue)]",
  "bg-[var(--catalog-green)]",
  "bg-[var(--catalog-red)]",
] as const;

const ROTATION_CLASSES = [
  "lg:rotate-[1.1deg]",
  "lg:-rotate-[0.8deg]",
  "lg:rotate-[0.7deg]",
  "lg:-rotate-[0.7deg]",
  "lg:rotate-[0.8deg]",
  "lg:-rotate-[1.1deg]",
] as const;

const BAR_COLORS = [
  "bg-[var(--catalog-pink)]",
  "bg-[var(--catalog-yellow)]",
  "bg-[var(--catalog-blue)]",
  "bg-[var(--catalog-green)]",
  "bg-[var(--catalog-red)]",
];

const BAR_WIDTHS = [
  "w-[20%]",
  "w-[40%]",
  "w-[60%]",
  "w-[80%]",
  "w-[96%]",
  "w-[34%]",
  "w-[35%]",
  "w-[36%]",
  "w-[38%]",
  "w-[42%]",
  "w-[46%]",
  "w-[48%]",
  "w-[52%]",
  "w-[54%]",
  "w-[63%]",
  "w-[64%]",
  "w-[68%]",
  "w-[70%]",
  "w-[71%]",
  "w-[72%]",
  "w-[79%]",
  "w-[82%]",
  "w-[84%]",
  "w-[86%]",
  "w-[88%]",
  "w-[91%]",
  "w-[92%]",
  "w-[94%]",
] as const;

function getBarWidth(value: number): string {
  const clamped = Math.max(20, Math.min(100, value));
  const nearest = [...BAR_WIDTHS].sort((a, b) => {
    const aValue = Number(a.match(/\d+/)?.[0] ?? 0);
    const bValue = Number(b.match(/\d+/)?.[0] ?? 0);
    return Math.abs(aValue - clamped) - Math.abs(bValue - clamped);
  })[0];

  return nearest ?? "w-[60%]";
}

function formatFilter(value: string): string {
  if (value === "completed") return STATUS_LABELS.completed;
  if (value === "ongoing") return STATUS_LABELS.ongoing;
  if (value in WORD_COUNT_RANGES) {
    return WORD_COUNT_RANGES[value as WordCountBucket].label;
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10_000 ? 0 : 1)}K`;
  return String(value);
}

function formatDossierCode(fic: Fic, index: number): string {
  const numericId = fic.id.match(/\d+/)?.[0];
  const code = numericId ?? String(index + 1).padStart(3, "0");
  return `AO3-${code.slice(-6).padStart(3, "0")}`;
}

function getMatchScore(fic: Fic): number {
  const stateAverage =
    (fic.state.spice + fic.state.angst + fic.state.fluff + fic.state.plot + fic.state.romance) / 5;
  const kudosWeight = Math.min(fic.stats.kudos / 2000, 10);
  return Math.min(99, Math.max(68, Math.round(70 + stateAverage * 4 + kudosWeight)));
}

function getMoodBars(fic: Fic): [number, number, number, number, number] {
  return [
    fic.state.spice,
    fic.state.angst,
    fic.state.fluff,
    fic.state.plot,
    fic.state.romance,
  ].map((value) => Math.max(20, Math.min(100, value * 20))) as [
    number,
    number,
    number,
    number,
    number,
  ];
}

function DossierCard({ fic, index }: { fic: Fic; index: number }) {
  const match = getMatchScore(fic);
  const bars = getMoodBars(fic);
  const tags = fic.tags.slice(0, 3);

  return (
    <a
      id={fic.id}
      href={`/fic/${fic.id}`}
      className={cn(
        "group relative block min-h-[250px] border border-[var(--catalog-line)] bg-[var(--catalog-panel)] p-[18px] shadow-[0_28px_80px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-[var(--catalog-pink)]/70 focus-visible:border-[var(--catalog-pink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--catalog-pink)]/45 sm:min-h-[270px] sm:p-[22px]",
        "before:absolute before:inset-x-4 before:top-3 before:h-px before:bg-[var(--catalog-line-faint)]",
        ROTATION_CLASSES[index % ROTATION_CLASSES.length],
      )}
      aria-label={`Open dossier for ${fic.title}`}
    >
      <span className={cn("absolute bottom-0 left-0 top-0 w-[7px]", ACCENT_CLASSES[index % ACCENT_CLASSES.length])} />
      <div className="relative flex h-full flex-col">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--catalog-dim)]">
              {formatDossierCode(fic, index)}
            </p>
            <h2 className="mt-3 max-w-[18rem] font-serif text-[24px] font-bold leading-[1.03] text-[var(--catalog-ink)]">
              {fic.title}
            </h2>
          </div>
          <div className="shrink-0 -rotate-[4deg] border border-[var(--catalog-red)]/55 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--catalog-red)]">
            {fic.rating}
          </div>
        </div>

        <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[var(--catalog-pink)]">
          {fic.author}
        </p>
        <p className="mt-3 line-clamp-6 min-h-[42px] max-w-[22rem] text-[13px] leading-[1.45] text-[var(--catalog-muted)] sm:min-h-[48px]">
          {fic.summary || "No archive summary has been recorded yet."}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {tags.length > 0 ? (
            tags.map((tag) => (
              <span
                key={`${fic.id}-${tag}`}
                className="max-w-full truncate border border-[var(--catalog-line)] bg-[var(--catalog-bg-deep)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--catalog-muted)]"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="border border-[var(--catalog-line)] bg-[var(--catalog-bg-deep)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--catalog-muted)]">
              untagged
            </span>
          )}
        </div>

        <div className="mt-auto pt-5">
          <div className="mb-2 flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.22em]">
            <p className="text-[var(--catalog-dim)]">Mood trace</p>
            <p className="text-[var(--catalog-muted)]" aria-label="Spice, angst, fluff, plot, romance">
              S A F P R
            </p>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {bars.map((bar, barIndex) => (
              <div
                key={`${fic.id}-bar-${barIndex}`}
                className="h-[10px] bg-[var(--catalog-line-faint)]"
              >
                <div
                  className={cn(
                    "h-full",
                    BAR_COLORS[barIndex],
                    getBarWidth(bar),
                  )}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 border border-[var(--catalog-line-faint)] font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--catalog-muted)]">
            <span className="border-r border-[var(--catalog-line-faint)] px-2 py-2">
              {formatCompactNumber(fic.stats.words)}
            </span>
            <span className="border-r border-[var(--catalog-line-faint)] px-2 py-2">
              {formatCompactNumber(fic.stats.kudos)}
            </span>
            <span className="px-2 py-2 text-right">{match}%</span>
          </div>
          <div className="mt-3 flex items-center justify-end font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--catalog-pink)] opacity-80 transition group-hover:opacity-100">
            Open dossier
            <ArrowRight className="ml-2 size-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </div>
        </div>
      </div>
      <span className="absolute right-4 top-4 font-mono text-[10px] text-[var(--catalog-line)]">
        {String(index + 1).padStart(2, "0")}
      </span>
    </a>
  );
}

export default function DiscoveryArchiveCatalog() {
  const [query, setQuery] = useState("");
  const [rating, setRating] = useState<Rating | "all">("all");
  const [length, setLength] = useState<LengthFilter | "all">("all");
  const [status, setStatus] = useState<StatusFilter | "all">("all");

  const filters: FilterState = useMemo(
    () => ({
      q: query,
      ratings: rating === "all" ? [] : [rating],
      wordCount: length === "all" ? "any" : length,
      vibes: [],
      signals: [],
    }),
    [length, query, rating],
  );

  const {
    items,
    total,
    error,
    hasMore,
    isInitialLoading,
    isLoadingMore,
    loadMore,
  } = usePaginatedFics(PAGE_SIZE, filters, true);

  const visibleFics = useMemo(() => {
    return status === "all" ? items : items.filter((fic) => fic.status === status);
  }, [items, status]);

  const activeFilters = [
    rating !== "all" ? `Rating: ${rating}` : null,
    length !== "all" ? `Length: ${formatFilter(length)}` : null,
    status !== "all" ? `Status: ${formatFilter(status)}` : null,
    query.trim() ? `Search: ${query.trim()}` : null,
  ].filter(Boolean);

  const recoveredCount = status === "all" && total !== null ? total : visibleFics.length;

  return (
    <div className="min-h-screen overflow-hidden bg-[var(--catalog-bg)] text-[var(--catalog-ink)]">
      <main className="relative mx-auto min-h-screen w-full max-w-[1440px] px-5 py-8 sm:px-8 sm:py-12 lg:px-[72px] lg:py-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-44 -top-40 hidden h-[520px] w-[520px] rounded-full bg-[var(--catalog-rose)]/25 blur-[90px] sm:block" />
          <div className="absolute right-[-110px] top-0 hidden h-full w-[390px] bg-[linear-gradient(180deg,rgba(143,14,77,0.12),rgba(198,106,61,0.09),transparent)] sm:block" />
          <div className="absolute left-1/2 top-0 h-full w-px bg-[var(--catalog-line-faint)]" />
          <div className="absolute left-[88px] top-0 hidden h-full w-px bg-[var(--catalog-line-faint)] lg:block" />
          <div className="absolute right-[88px] top-0 hidden h-full w-px bg-[var(--catalog-line-faint)] lg:block" />
        </div>

        <header className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_312px] lg:items-start">
          <section>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--catalog-dim)] sm:text-[11px] sm:tracking-[0.36em]">
              CaitVi Fic Catalog // Curated Index
            </p>
            <h1 className="mt-4 max-w-[820px] font-serif text-[39px] font-black leading-[0.94] text-[var(--catalog-ink)] sm:text-[58px] lg:text-[64px]">
              Find the right record,
              <br />
              not every record.
            </h1>
          </section>

          <aside className="relative border-l border-[var(--catalog-pink)]/55 py-1 pl-5 lg:mt-1 lg:pl-6 lg:pt-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--catalog-pink)]">
              Reader Match Patch
            </p>
            <p className="mt-3 max-w-[300px] font-serif text-[14px] italic leading-[1.35] text-[var(--catalog-muted)] sm:text-[18px] lg:mt-8 lg:max-w-[260px]">
              Rewards the long fics, rare pair moods, and tags you keep opening
              when nobody is looking.
            </p>
          </aside>
        </header>

        <section
          aria-label="Archive controls"
          className="relative z-10 mt-7 border-y border-[var(--catalog-line)] py-4 sm:mt-8 sm:py-5"
        >
          <div className="grid gap-5 xl:grid-cols-[350px_1fr] xl:items-center">
            <label className="flex h-[48px] items-center border border-[var(--catalog-line)] bg-[var(--catalog-bg-deep)] px-4 focus-within:border-[var(--catalog-pink)]/70">
              <Search className="mr-3 size-4 text-[var(--catalog-pink)]" aria-hidden="true" />
              <span className="sr-only">Search curated records</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--catalog-ink)] placeholder:text-[var(--catalog-dim)] focus:outline-none"
                placeholder="Search title, author"
              />
            </label>

            <div className="grid gap-3 md:grid-cols-3 md:gap-4">
              <div className="min-w-0">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--catalog-dim)]">
                  Rating
                </p>
                <div className="caitvi-scrollbar flex min-h-[31px] gap-1.5 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0">
                  <button
                    type="button"
                    onClick={() => setRating("all")}
                    className={cn(
                      "min-h-9 shrink-0 border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition",
                      rating === "all"
                        ? "border-[var(--catalog-pink)] bg-[var(--catalog-pink)] text-[var(--catalog-bg)]"
                        : "border-[var(--catalog-line)] bg-[var(--catalog-bg-deep)] text-[var(--catalog-muted)] hover:border-[var(--catalog-pink)]/70",
                    )}
                  >
                    All
                  </button>
                  {RATINGS.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className={cn(
                        "min-h-9 shrink-0 border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition",
                        rating === value
                          ? "border-[var(--catalog-pink)] bg-[var(--catalog-pink)] text-[var(--catalog-bg)]"
                          : "border-[var(--catalog-line)] bg-[var(--catalog-bg-deep)] text-[var(--catalog-muted)] hover:border-[var(--catalog-pink)]/70",
                      )}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-w-0">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--catalog-dim)]">
                  Length
                </p>
                <div className="caitvi-scrollbar flex min-h-[31px] gap-1.5 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0">
                  <button
                    type="button"
                    onClick={() => setLength("all")}
                    className={cn(
                      "min-h-9 shrink-0 border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition",
                      length === "all"
                        ? "border-[var(--catalog-pink)] bg-[var(--catalog-pink)] text-[var(--catalog-bg)]"
                        : "border-[var(--catalog-line)] bg-[var(--catalog-bg-deep)] text-[var(--catalog-muted)] hover:border-[var(--catalog-pink)]/70",
                    )}
                  >
                    All
                  </button>
                  {LENGTHS.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setLength(value)}
                      className={cn(
                        "min-h-9 shrink-0 border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition",
                        length === value
                          ? "border-[var(--catalog-pink)] bg-[var(--catalog-pink)] text-[var(--catalog-bg)]"
                          : "border-[var(--catalog-line)] bg-[var(--catalog-bg-deep)] text-[var(--catalog-muted)] hover:border-[var(--catalog-pink)]/70",
                      )}
                    >
                      {formatFilter(value)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-w-0">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--catalog-dim)]">
                  Status
                </p>
                <div className="caitvi-scrollbar flex min-h-[31px] gap-1.5 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0">
                  <button
                    type="button"
                    onClick={() => setStatus("all")}
                    className={cn(
                      "min-h-9 shrink-0 border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition",
                      status === "all"
                        ? "border-[var(--catalog-pink)] bg-[var(--catalog-pink)] text-[var(--catalog-bg)]"
                        : "border-[var(--catalog-line)] bg-[var(--catalog-bg-deep)] text-[var(--catalog-muted)] hover:border-[var(--catalog-pink)]/70",
                    )}
                  >
                    All
                  </button>
                  {STATUSES.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setStatus(value)}
                      className={cn(
                        "min-h-9 shrink-0 border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition",
                        status === value
                          ? "border-[var(--catalog-pink)] bg-[var(--catalog-pink)] text-[var(--catalog-bg)]"
                          : "border-[var(--catalog-line)] bg-[var(--catalog-bg-deep)] text-[var(--catalog-muted)] hover:border-[var(--catalog-pink)]/70",
                      )}
                    >
                      {formatFilter(value)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--catalog-line-faint)] pb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--catalog-dim)] sm:text-[11px]">
          <p className="flex items-center gap-2 text-[var(--catalog-muted)]">
            {isInitialLoading ? (
              <Loader2 className="size-4 animate-spin text-[var(--catalog-pink)]" aria-hidden="true" />
            ) : (
              <Check className="size-4 text-[var(--catalog-green)]" aria-hidden="true" />
            )}
            {isInitialLoading
                ? "Recovering curated records"
                : `${recoveredCount} curated records · match sorted`}
          </p>
          {activeFilters.length > 0 && (
            <p className="max-w-full truncate text-[var(--catalog-pink)]">
              {activeFilters.join(" · ")}
            </p>
          )}
        </section>

        {error && (
          <section className="relative z-10 mt-10 border border-[var(--catalog-red)]/50 bg-[var(--catalog-panel)] px-6 py-8">
            <h2 className="font-serif text-[28px] font-bold text-[var(--catalog-ink)]">
              Archive request failed.
            </h2>
            <p className="mt-3 text-[14px] leading-6 text-[var(--catalog-muted)]">
              {error.message}
            </p>
          </section>
        )}

        {isInitialLoading && !error ? (
          <section className="relative z-10 mt-7 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="min-h-[250px] border border-[var(--catalog-line)] bg-[var(--catalog-panel)] p-[18px] sm:min-h-[270px] sm:p-[22px]"
              >
                <div className="h-3 w-28 bg-[var(--catalog-line-faint)]" />
                <div className="mt-8 h-8 w-3/4 bg-[var(--catalog-line-faint)]" />
                <div className="mt-5 h-3 w-24 bg-[var(--catalog-line-faint)]" />
                <div className="mt-6 h-16 w-full bg-[var(--catalog-line-faint)]" />
              </div>
            ))}
          </section>
        ) : visibleFics.length > 0 ? (
          <>
            <section
              aria-label="Dossier results"
              className="relative z-10 mt-7 grid gap-7 md:grid-cols-2 lg:grid-cols-3"
            >
              {visibleFics.map((fic, index) => (
                <DossierCard key={fic.id} fic={fic} index={index} />
              ))}
            </section>
            {hasMore && (
              <div className="relative z-10 mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() => void loadMore()}
                  disabled={isLoadingMore}
                  className="min-h-11 border border-[var(--catalog-line)] bg-[var(--catalog-bg-deep)] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--catalog-muted)] transition hover:border-[var(--catalog-pink)]/70 hover:text-[var(--catalog-ink)] disabled:cursor-wait disabled:opacity-60"
                >
                  {isLoadingMore ? "Recovering more curated records" : "Load more curated records"}
                </button>
              </div>
            )}
          </>
        ) : !error ? (
          <section className="relative z-10 mt-10 border border-[var(--catalog-line)] bg-[var(--catalog-panel)] px-6 py-12 text-center">
            <FileSearch className="mx-auto size-10 text-[var(--catalog-pink)]" aria-hidden="true" />
            <h2 className="mt-5 font-serif text-[32px] font-bold text-[var(--catalog-ink)]">
              No record matches this case.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-6 text-[var(--catalog-muted)]">
              Remove one filter, or search by title or author.
            </p>
          </section>
        ) : null}

        <footer className="relative z-10 mt-12 flex flex-wrap items-center gap-4 font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--catalog-dim)]">
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Selected from the CaitVi curated catalog.
          </span>
          <span className="hidden h-px flex-1 bg-[var(--catalog-line-faint)] sm:block" />
          <span className="flex items-center gap-2">
            <BookOpen className="size-4" aria-hidden="true" />
            CaitVi 02
          </span>
        </footer>
      </main>
    </div>
  );
}
