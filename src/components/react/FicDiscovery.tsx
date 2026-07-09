import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import ActiveFilters from "./ActiveFilters";
import SearchBar from "./SearchBar";
import FilterBar from "./FilterBar";
import { FileSearch } from "lucide-react";
import FicCard from "./FicCard";
import { FicCardSkeleton } from "./FicCard/FicCardSkeleton";
import { ErrorBoundary } from "./ErrorBoundary";
import { useFicFilters } from "@/hooks/use-fic-filters";
import { usePaginatedFics } from "@/hooks/use-paginated-fics";

const FADE_IN_VIEW = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true } as const,
  transition: { duration: 0.6, delay: 0.2 },
};

const PAGE_SIZE = 24;

function FicDiscoveryContent() {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { filters, setFilters, resetFilters, isReady } = useFicFilters();

  const {
    items,
    total,
    error,
    hasMore,
    isInitialLoading,
    isLoadingMore,
    loadMore,
  } = usePaginatedFics(PAGE_SIZE, filters, isReady);

  useEffect(() => {
    if (isInitialLoading || !hasMore) return;
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [hasMore, isInitialLoading, loadMore]);

  return (
    <section
      id="featured"
      aria-label="Fan fiction collection"
      className="w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pb-16 pt-0 md:pb-20 min-h-screen"
    >
      <div className="mb-16">
        <motion.div {...FADE_IN_VIEW} className="text-center">
          <h2 className="text-[clamp(2rem,4vw+0.5rem,3rem)] font-serif font-bold text-white mb-4">
            Curated Case Files
          </h2>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Browse selected CaitVi records by rating, length, and mood. Not every fic, the right ones.
          </p>
        </motion.div>

        <motion.div
          {...FADE_IN_VIEW}
          className="my-10 border-y border-white/[0.08] py-5 sm:py-6"
        >
          <div className="mb-4 hidden flex-wrap items-end justify-between gap-2 sm:flex">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">
                Catalog Query
              </p>
              <p className="mt-1 text-sm text-white/50">
                Search the curated case index.
              </p>
            </div>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/25">
              Rating // Length // Vibe
            </p>
          </div>
          <SearchBar
            value={filters.q}
            onChange={(q) => setFilters((prev) => ({ ...prev, q }))}
          />
          <FilterBar filters={filters} onChange={setFilters} />
          <ActiveFilters filters={filters} onChange={setFilters} onReset={resetFilters} />
          {error && (
            <p className="mt-3 text-sm text-amber-300">{error.message}</p>
          )}
        </motion.div>

        {/* Result count */}
        {!isInitialLoading && total !== null && (
          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">
            Curated records:{" "}
            <span className="text-white/75">{total}</span>{" "}
            {total === 1 ? "file" : "files"}
          </p>
        )}

        {/* Fic List */}
        <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
          {isInitialLoading ? (
            <>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <FicCardSkeleton key={i} />
              ))}
            </>
          ) : (
            <AnimatePresence mode="popLayout">
              {items.map((fic) => (
                <motion.div
                  key={fic.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <FicCard fic={fic} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {hasMore && !isInitialLoading && (
          <div ref={loadMoreRef} className="h-10 w-full" />
        )}
        {isLoadingMore && (
          <p className="mt-4 text-center text-sm text-white/70">
            Loading more case files...
          </p>
        )}

        {/* Empty State */}
        {!isInitialLoading && items.length === 0 && (
          <motion.div
            {...FADE_IN_VIEW}
            className="border border-white/[0.08] bg-black/10 px-6 py-12 text-center"
          >
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-[4px] border border-white/[0.08] bg-white/[0.03]">
              <FileSearch className="size-8 text-white/40" />
            </div>
            <h3 className="mb-2 font-serif text-2xl text-white">
              No curated record
            </h3>
            <p className="text-white/70">
              Adjust the query or remove a filter to reopen the catalog.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default function FicDiscovery() {
  return (
    <ErrorBoundary>
      <FicDiscoveryContent />
    </ErrorBoundary>
  );
}
