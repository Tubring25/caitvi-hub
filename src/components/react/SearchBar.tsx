import { useState } from "react";
import { motion } from "motion/react";
import { SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Gradient border layer — visible on focus */}
      <div
        className={cn(
          "absolute -inset-px rounded-2xl transition-opacity duration-300",
          isFocused ? "opacity-100" : "opacity-0"
        )}
        style={{ background: "var(--brand-gradient)" }}
      />

      {/* Glass panel */}
      <div
        className={cn(
          "relative rounded-2xl border backdrop-blur-xl transition-colors duration-300",
          isFocused
            ? "border-transparent"
            : "border-white/10"
        )}
        style={{
          backgroundColor: isFocused
            ? "rgba(10, 6, 8, 0.85)"
            : "rgba(255, 255, 255, 0.05)",
        }}
      >
        <motion.div
          animate={{ x: isFocused ? 2 : 0, scale: isFocused ? 1.1 : 1 }}
          transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
          className="absolute left-5 top-1/2 -translate-y-1/2"
        >
          <SearchIcon
            className={cn(
              "w-5 h-5 transition-colors duration-300",
              isFocused ? "text-[var(--lesbian-pink)]" : "text-white/40"
            )}
          />
        </motion.div>

        <input
          type="text"
          aria-label="Search fan fiction"
          placeholder="Search by title, author, or tag..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="relative w-full py-4 pl-14 pr-6 bg-transparent border-none text-white text-lg placeholder-white/40 focus:outline-none"
        />
      </div>
    </div>
  );
}