import { useMemo } from "react";
import { motion } from "motion/react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Fic, ReadingStatus } from "@/types/fic";
import type { ShelfEntry } from "@/hooks/use-shelf-fics";
import { BookSpine } from "./BookSpine";

const EXPO_EASE = [0.16, 1, 0.3, 1] as const;

const STATUS_LABELS: Record<ReadingStatus, string> = {
  none: "",
  bookmarked: "To Read",
  reading: "Reading",
  completed: "Completed",
  dropped: "Dropped",
};

interface ShelfRowProps {
  status: ReadingStatus;
  entries: ShelfEntry[];
  selectedFicId: string | null;
  onSelect: (fic: Fic) => void;
  onReorder: (status: ReadingStatus, activeId: string, overId: string) => void;
}

export function ShelfRow({ status, entries, selectedFicId, onSelect, onReorder }: ShelfRowProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const sortableIds = useMemo(() => entries.map((e) => e.fic.id), [entries]);

  if (entries.length === 0) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorder(status, String(active.id), String(over.id));
  };

  return (
    <div className="mb-12 last:mb-0">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: EXPO_EASE }}
        className="mb-4 flex items-center gap-3 justify-center"
      >
        <h3 className="text-xs uppercase tracking-[0.3em] text-white/40 font-sans font-medium">
          {STATUS_LABELS[status]}
        </h3>
        <span className="text-[11px] font-mono text-white/25">
          {entries.length}
        </span>
      </motion.div>

      <div className="mx-auto w-fit max-w-full">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={sortableIds} strategy={horizontalListSortingStrategy}>
            <div className="flex max-w-full items-end justify-center gap-0 overflow-visible px-3 sm:px-6">
              <div className="mr-1 h-[120px] w-4 shrink-0 rounded-[2px] border border-[#D4AF37]/5 bg-[linear-gradient(135deg,rgba(212,175,55,0.13),rgba(212,175,55,0.04))] shadow-[inset_1px_0_0_rgba(255,255,255,0.05)]" />
              {entries.map((entry) => (
                <BookSpine
                  key={entry.fic.id}
                  fic={entry.fic}
                  status={entry.status}
                  isSelected={selectedFicId === entry.fic.id}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: EXPO_EASE }}
          className="relative mt-0 h-[14px] min-w-[260px] origin-center rounded-b-[3px] bg-[linear-gradient(180deg,rgba(80,50,30,0.28)_0%,rgba(52,28,16,0.24)_45%,rgba(28,14,8,0.36)_100%)] shadow-[0_5px_14px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.035)] before:absolute before:inset-x-0 before:top-[-3px] before:h-[3px] before:rounded-t-[2px] before:bg-[linear-gradient(180deg,rgba(110,70,38,0.28),rgba(80,50,30,0.24))] before:content-[''] after:absolute after:bottom-[-18px] after:left-[6%] after:right-[6%] after:h-[18px] after:bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.18),transparent_70%)] after:content-['']"
        />
      </div>
    </div>
  );
}
