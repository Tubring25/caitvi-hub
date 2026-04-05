import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import SearchBar from "./SearchBar";
import FilterBar from "./FilterBar";
import { Sparkles } from "lucide-react";
import FicCard from "./FicCard";
import { FicCardSkeleton } from "./FicCard/FicCardSkeleton";
import { ErrorBoundary } from "./ErrorBoundary";
import { usePaginatedFics } from "@/hooks/use-paginated-fics";
import { useReadingStatus } from "@/hooks/use-reading-status";
import { DEFAULT_FILTERS } from "@/types/filters";
import type { FilterState } from "@/types/filters";

const FADE_IN_VIEW = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true } as const,
  transition: { duration: 0.6, delay: 0.2 },
};

const PAGE_SIZE = 24;

function FicDiscoveryContent() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { getStatus, updateStatus } = useReadingStatus();

  const {
    items,
    total,
    error,
    hasMore,
    isInitialLoading,
    isLoadingMore,
    loadMore,
  } = usePaginatedFics(PAGE_SIZE, filters);

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
      className="w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-16 md:py-20 min-h-screen"
    >
      <div className="mb-16">
        <motion.div {...FADE_IN_VIEW} className="text-center">
          <h2 className="text-[clamp(2rem,4vw+0.5rem,3rem)] font-serif font-bold text-white mb-4">
            Find Your Next Obsession
          </h2>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Curated collections sorted by spice, angst, and everything in
            between.
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div {...FADE_IN_VIEW} className="my-10 space-y-4">
          <SearchBar
            value={filters.q}
            onChange={(q) => setFilters((prev) => ({ ...prev, q }))}
          />
          <FilterBar filters={filters} onChange={setFilters} />
          {error && (
            <p className="mt-3 text-sm text-amber-300">{error.message}</p>
          )}
        </motion.div>

        {/* Result count */}
        {!isInitialLoading && total !== null && (
          <p className="mb-6 text-sm text-white/50 font-sans">
            Showing{" "}
            <span className="text-white/80 font-medium">
              {total}
            </span>{" "}
            {total === 1 ? "fic" : "fics"}
          </p>
        )}

        {/* Fic List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  <FicCard
                    fic={fic}
                    readingStatus={getStatus(fic.id)}
                    onStatusChange={(status) => updateStatus(fic.id, status)}
                  />
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
            Loading more fics...
          </p>
        )}

        {/* Empty State */}
        {!isInitialLoading && items.length === 0 && (
          <motion.div {...FADE_IN_VIEW} className="text-center">
            <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="text-white/40 w-10 h-10" />
            </div>
            <h3 className="text-2xl font-serif text-white mb-2">
              No fics found
            </h3>
            <p className="text-white/70">
              Try adjusting your filters or search query.
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
