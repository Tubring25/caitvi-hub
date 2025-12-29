import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Gift } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MoodSelector } from "./MoodSelector";
import { OpeningAnimation } from "./OpeningAnimation";
import { ResultCard } from "./ResultCard";
import { getReadingStatusMap } from "@/lib/storage";
import type { Fic } from "@/types/fic";

// Taste of Blind Box
export type BlindBoxMood = "fluff" | "angst" | "spicy";

// Stage of Blind Box
type BlindBoxStage = "select" | "opening" | "result";

interface BlindBoxProps {
  fics: Fic[];
}

export default function BlindBox({ fics }: BlindBoxProps) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<BlindBoxStage>("select");
  const [selectedMood, setSelectedMood] = useState<BlindBoxMood | null>(null);
  const [resultFic, setResultFic] = useState<Fic | null>(null);

  // Filter logic: exclude read/reading articles, filter by mood
  const pickRandomFic = (mood: BlindBoxMood): Fic | null => {
    const statusMap = getReadingStatusMap();
    
    // Exclude reading and completed articles
    const availableFics = fics.filter(fic => {
      const status = statusMap[fic.id];
      return status !== "reading" && status !== "completed";
    });

    // Filter by mood
    let filtered: Fic[] = [];
    switch (mood) {
      case "fluff":
        filtered = availableFics.filter(fic => fic.state.fluff >= 4);
        break;
      case "angst":
        filtered = availableFics.filter(fic => fic.state.angst >= 4);
        break;
      case "spicy":
        filtered = availableFics.filter(fic => fic.state.spice >= 4);
        break;
    }

    // Fallback: if no articles are left, return the article with the highest kudos
    if (filtered.length === 0) {
      const sorted = [...availableFics].sort((a, b) => b.stats.kudos - a.stats.kudos);
      return sorted[0] || null;
    }

    // Randomly select an article
    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex];
  };

  const handleMoodSelect = (mood: BlindBoxMood) => {
    setSelectedMood(mood);
    setStage("opening");

    setTimeout(() => {
      const fic = pickRandomFic(mood);
      setResultFic(fic);
      setStage("result");
    }, 2500);
  };

  // Reset state
  const handleReset = () => {
    setStage("select");
    setSelectedMood(null);
    setResultFic(null);
  };

  // 关闭时重置
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // 延迟重置，避免动画中途切换
      setTimeout(handleReset, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          className="gap-2 text-base font-semibold hover:bg-white/10"
        >
          <Gift className="size-5" />
          <span className="hidden sm:inline">Blind Box</span>
        </Button>
      </DialogTrigger>

      <DialogContent 
        className="bg-background/95 backdrop-blur-xl border-white/10 max-w-md min-h-[350px]"
        showCloseButton={stage !== "opening"}
      >
        <AnimatePresence mode="wait">
          {stage === "select" && (
            <MoodSelector key="select" onSelect={handleMoodSelect} />
          )}

          {stage === "opening" && (
            <OpeningAnimation key="opening" mood={selectedMood || "fluff"} />
          )}

          {stage === "result" && (
            <ResultCard 
              key="result" 
              fic={resultFic} 
              onRetry={handleReset}
              onClose={() => setOpen(false)}
            />
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}