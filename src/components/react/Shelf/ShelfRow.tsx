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

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={sortableIds} strategy={horizontalListSortingStrategy}>
          <div className="flex items-end gap-3 flex-wrap justify-center">
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
        className="mt-1 h-[2px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent origin-center"
      />
    </div>
  );
}
