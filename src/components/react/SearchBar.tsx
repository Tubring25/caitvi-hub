import { useState, type InputEventHandler } from "react";
import { motion } from "motion/react";
import { Search, SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange}: SearchBarProps){
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      initial={false}
      animate={{
        boxShadow: isFocused ? '0 0 0 2px var(--color-primary)' : '0 0 0 1px var(--color-border)'
      }}
      className="relative w-full max-w-2xl mx-auto rounded-2xl overflow-hidden bg-secondary/80 backdrop-blur-xl transition-all duration-300"
    >
      <input type="text" placeholder="Search by title, author, or tag..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full py-4 pl-14 pr-6 bg-transparent border-none text-white text-lg placeholder-white/40 focus:outline-none"
      />
      <SearchIcon className={cn('absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300', isFocused ? 'text-accent' : 'text-white/40')} />
    </motion.div>
  )
}