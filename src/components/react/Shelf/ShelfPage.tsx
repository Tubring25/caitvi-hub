import { useState } from "react";
import { AnimatePresence, LayoutGroup } from "motion/react";
import { useReadingStatus } from "@/hooks/use-reading-status";
import { useShelfFics } from "@/hooks/use-shelf-fics";
import type { Fic, ReadingStatus } from "@/types/fic";
import { EmptyShelf } from "./EmptyShelf";
import { ShelfRow } from "./ShelfRow";
import { SpineDetail } from "./SpineDetail";

const STATUS_ORDER: ReadingStatus[] = ["bookmarked", "reading", "completed", "dropped"];

export default function ShelfPage() {
  const { statusMap, getStatus, updateStatus } = useReadingStatus();
  const { entries, isLoading, sortEntries, reorder, ensureOrder } = useShelfFics(statusMap);
  const [selectedFic, setSelectedFic] = useState<Fic | null>(null);

  const activeEntries = entries.filter((e) => e.status !== "none");

  const statsSummary = (() => {
    if (activeEntries.length === 0) return null;
    const counts: Partial<Record<ReadingStatus, number>> = {};
    for (const e of activeEntries) {
      counts[e.status] = (counts[e.status] ?? 0) + 1;
    }
    const parts: string[] = [];
    if (counts.reading) parts.push(`${counts.reading} reading`);
    if (counts.bookmarked) parts.push(`${counts.bookmarked} to read`);
    if (counts.completed) parts.push(`${counts.completed} completed`);
    if (counts.dropped) parts.push(`${counts.dropped} dropped`);
    return `${activeEntries.length} ${activeEntries.length === 1 ? "story" : "stories"} · ${parts.join(" · ")}`;
  })();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-sm text-white/40 font-sans">Loading shelf…</div>
      </div>
    );
  }

  if (activeEntries.length === 0) {
    return <EmptyShelf />;
  }

  const grouped = STATUS_ORDER.map((status) => {
    const items = activeEntries.filter((e) => e.status === status);
    if (items.length === 0) return null;
    ensureOrder(status, items.map((e) => e.fic.id));
    const sorted = sortEntries(status, items);
    return { status, items: sorted };
  }).filter((g): g is NonNullable<typeof g> => g !== null);

  const handleSelect = (fic: Fic) => {
    setSelectedFic((prev) => (prev?.id === fic.id ? null : fic));
  };

  return (
    <LayoutGroup>
      <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-10 md:py-14">
        {statsSummary && (
          <p className="text-center text-xs font-mono text-white/30 tracking-wide mb-10">
            {statsSummary}
          </p>
        )}
        {grouped.map((group) => (
          <ShelfRow
            key={group.status}
            status={group.status}
            entries={group.items}
            selectedFicId={selectedFic?.id ?? null}
            onSelect={handleSelect}
            onReorder={reorder}
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedFic && (
          <SpineDetail
            key={selectedFic.id}
            fic={selectedFic}
            currentStatus={getStatus(selectedFic.id)}
            onStatusChange={(ficId, status) => {
              updateStatus(ficId, status);
              if (status === "none") setSelectedFic(null);
            }}
            onClose={() => setSelectedFic(null)}
          />
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
