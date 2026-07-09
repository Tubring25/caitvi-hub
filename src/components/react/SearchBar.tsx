import { useState } from "react";
import { SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <label
      className={cn(
        "relative flex min-h-[52px] w-full items-center rounded-[4px] border bg-[rgba(18,10,8,0.68)] transition-colors duration-300",
        isFocused
          ? "border-[var(--lesbian-pink)]/55"
          : "border-white/[0.12] hover:border-white/20",
      )}
    >
      <SearchIcon
        className={cn(
          "ml-4 size-4 shrink-0 transition-colors duration-300",
          isFocused ? "text-[var(--lesbian-pink)]" : "text-white/40",
        )}
        aria-hidden="true"
      />
      <span className="sr-only">Search fan fiction</span>
      <input
        type="text"
        aria-label="Search fan fiction"
        placeholder="Search title or author"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="min-w-0 flex-1 border-none bg-transparent px-4 py-3.5 font-sans text-base text-white placeholder:text-white/35 focus:outline-none"
      />
      <span className="mr-4 hidden font-mono text-[9px] uppercase tracking-[0.18em] text-white/20 sm:inline">
        Title // Agent
      </span>
    </label>
  );
}
