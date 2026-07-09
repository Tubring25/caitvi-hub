import { useRef } from "react";
import { Bookmark, BookOpen, CheckCircle, ChevronDown, XCircle } from "lucide-react";

import { useReadingStatus } from "@/hooks/use-reading-status";
import { cn } from "@/lib/utils";
import type { ReadingStatus } from "@/types/fic";
import type { ReactNode } from "react";

interface ShelfStatusMenuProps {
  ficId: string;
  className?: string;
  align?: "left" | "right";
}

const STATUS_OPTIONS: { key: ReadingStatus; label: string; icon: ReactNode }[] = [
  { key: "bookmarked", label: "To Read", icon: <Bookmark size={13} /> },
  { key: "reading", label: "Reading", icon: <BookOpen size={13} /> },
  { key: "completed", label: "Done", icon: <CheckCircle size={13} /> },
  { key: "dropped", label: "Dropped", icon: <XCircle size={13} /> },
];

const STATUS_LABELS: Record<ReadingStatus, string> = {
  none: "Shelf",
  bookmarked: "To Read",
  reading: "Reading",
  completed: "Done",
  dropped: "Dropped",
};

export default function ShelfStatusMenu({ ficId, className, align = "right" }: ShelfStatusMenuProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const { getStatus, updateStatus } = useReadingStatus();
  const status = getStatus(ficId);
  const isActive = status !== "none";

  const setStatus = (next: ReadingStatus) => {
    updateStatus(ficId, status === next ? "none" : next);
    detailsRef.current?.removeAttribute("open");
  };

  return (
    <details
      ref={detailsRef}
      className={cn("group relative inline-block text-left", className)}
      onClick={(event) => event.stopPropagation()}
    >
      <summary
        className={cn(
          "inline-flex cursor-pointer list-none items-center gap-1.5 rounded-[4px] border px-3 py-2",
          "font-mono text-[9px] font-bold uppercase tracking-[0.12em] transition-colors duration-200",
          "[&::-webkit-details-marker]:hidden",
          isActive
            ? "border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]/85"
            : "border-white/[0.08] bg-white/[0.025] text-white/42 hover:border-white/[0.14] hover:text-white/65",
        )}
      >
        <Bookmark size={12} />
        <span>{STATUS_LABELS[status]}</span>
        <ChevronDown size={12} className="transition-transform duration-200 group-open:rotate-180" />
      </summary>

      <div
        className={cn(
          "absolute top-[calc(100%+6px)] z-40 w-40 rounded-[4px] border border-white/[0.08] bg-[rgba(18,10,12,0.98)] p-1 shadow-[0_16px_40px_rgba(0,0,0,0.45)]",
          align === "left" ? "left-0" : "right-0",
        )}
      >
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setStatus(option.key)}
            className={cn(
              "flex w-full items-center gap-2 rounded-[3px] px-2.5 py-2 text-left",
              "font-mono text-[10px] uppercase tracking-[0.1em] transition-colors duration-150",
              status === option.key
                ? "bg-[#D4AF37]/10 text-[#D4AF37]/85"
                : "text-white/48 hover:bg-white/[0.04] hover:text-white/72",
            )}
          >
            {option.icon}
            <span>{option.label}</span>
          </button>
        ))}

        {isActive && (
          <button
            type="button"
            onClick={() => setStatus("none")}
            className="mt-1 flex w-full items-center gap-2 border-t border-white/[0.06] px-2.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-white/34 transition-colors duration-150 hover:text-white/58"
          >
            <XCircle size={13} />
            <span>Remove</span>
          </button>
        )}
      </div>
    </details>
  );
}
