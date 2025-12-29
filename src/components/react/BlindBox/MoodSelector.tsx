import { motion } from "motion/react";
import type { BlindBoxMood } from ".";
import { cn } from "@/lib/utils";


const MOODS: { key: BlindBoxMood; img: string; label: string; color: string }[] = [
  { 
    key: "fluff", 
    img: "/images/cupcake.png", 
    label: "Like a cupcake", 
    color: "border-pink-400/30 hover:bg-pink-400/10 hover:border-pink-400" 
  },
  { 
    key: "angst", 
    img: "/images/2heads_dog.png", 
    label: "Oil and Water", 
    color: "border-blue-400/30 hover:bg-blue-400/10 hover:border-blue-400" 
  },
  { 
    key: "spicy", 
    img: "/images/blind_box_18.png", 
    label: "Sorry to say,", 
    color: "border-red-400/30 hover:bg-red-400/10 hover:border-red-400" 
  },
];

interface MoodSelectorProps {
  onSelect: (mood: BlindBoxMood) => void; 
}

export function MoodSelector({ onSelect }: MoodSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center py-6"
    >
      <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
        Pick Your Poison
      </h2>
      <p className="text-muted-foreground text-sm mb-10 font-mono tracking-wide">
        SELECT A FLAVOR TO UNLOCK
      </p>

      <div className="grid grid-cols-3 gap-4 px-2">
        {MOODS.map((mood) => (
          <motion.button
            key={mood.key}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(mood.key)}
            className={`
              aspect-square rounded-2xl border-2 bg-white/5
              flex flex-col items-center justify-center gap-3
              transition-all duration-300 cursor-pointer p-4
              group
              ${mood.color}
            `}
          >
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
              <img 
                src={mood.img} 
                alt={mood.label} 
                className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs sm:text-sm font-bold text-foreground font-serif">{mood.key.toLocaleUpperCase()}</span>
              <span className="text-[10px] text-muted-foreground font-mono scale-90">{mood.label}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}