import { useState, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import { Gift } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MoodSelector } from "./MoodSelector";
import { OpeningAnimation } from "./OpeningAnimation";
import { ResultCard } from "./ResultCard";
import { getReadingStatusMap } from "@/lib/storage";
import type { Fic } from "@/types/fic";

export type BlindBoxMood = "fluff" | "angst" | "spicy";

type BlindBoxStage = "select" | "opening" | "result";

const MAX_RETRIES = 3;
const ANIMATION_DURATION_MS = 2500;

async function fetchRandomFic(mood: BlindBoxMood): Promise<Fic | null> {
  try {
    const res = await fetch(`/api/fics/random?mood=${mood}`);
    if (!res.ok) return null;
    return (await res.json()) as Fic;
  } catch {
    return null;
  }
}

async function fetchWithReadingExclusion(mood: BlindBoxMood): Promise<Fic | null> {
  const statusMap = getReadingStatusMap();

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const fic = await fetchRandomFic(mood);
    if (!fic) return null;

    const status = statusMap[fic.id];
    if (status !== "reading" && status !== "completed") return fic;
  }

  // All retries hit excluded fics — return the last one anyway
  return fetchRandomFic(mood);
}

export default function BlindBox() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<BlindBoxStage>("select");
  const [selectedMood, setSelectedMood] = useState<BlindBoxMood | null>(null);
  const [resultFic, setResultFic] = useState<Fic | null>(null);

  const handleMoodSelect = useCallback((mood: BlindBoxMood) => {
    setSelectedMood(mood);
    setStage("opening");

    const animationDelay = new Promise<void>((resolve) =>
      setTimeout(resolve, ANIMATION_DURATION_MS),
    );
    const ficPromise = fetchWithReadingExclusion(mood);

    Promise.all([animationDelay, ficPromise]).then(([, fic]) => {
      setResultFic(fic);
      setStage("result");
    });
  }, []);

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