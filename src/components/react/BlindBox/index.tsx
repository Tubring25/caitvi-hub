import { useState, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import { Gift } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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

async function fetchWithReadingExclusion(
  mood: BlindBoxMood,
): Promise<Fic | null> {
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

  const handleQuickRetry = useCallback(() => {
    if (!selectedMood) return;
    setStage("opening");
    setResultFic(null);

    const animationDelay = new Promise<void>((resolve) =>
      setTimeout(resolve, ANIMATION_DURATION_MS),
    );
    const ficPromise = fetchWithReadingExclusion(selectedMood);

    Promise.all([animationDelay, ficPromise]).then(([, fic]) => {
      setResultFic(fic);
      setStage("result");
    });
  }, [selectedMood]);

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
        <button className="group relative flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#D4AF37]/30 bg-white/[0.03] hover:bg-white/[0.08] hover:border-[#D4AF37]/60 transition-all duration-500 cursor-pointer overflow-hidden">
          {/* Shimmer sweep */}
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/[0.06] to-transparent pointer-events-none" />

          <Gift className="size-4 text-[#D4AF37]/70 group-hover:text-[#D4AF37] transition-colors duration-500" />
          <span className="hidden sm:inline text-[11px] uppercase tracking-[0.25em] font-sans font-medium text-white/50 group-hover:text-white/80 transition-colors duration-500">
            Blind Box
          </span>
        </button>
      </DialogTrigger>

      <DialogContent
        className="bg-[#1e0f14]/90 backdrop-blur-2xl border-[#D4AF37]/10 max-w-md min-h-[400px] shadow-[0_8px_64px_rgba(30,15,20,0.8),0_0_0_1px_rgba(212,175,55,0.06)] overflow-hidden"
        showCloseButton={stage !== "opening"}
      >
        {/* Warm ambient glow — top-left rose, bottom-right gold */}
        <div className="pointer-events-none absolute inset-0 rounded-lg overflow-hidden">
          <div className="absolute -top-24 -left-24 w-56 h-56 bg-[#A30262]/[0.07] rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-[#D4AF37]/[0.05] rounded-full blur-3xl" />
        </div>
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
              mood={selectedMood}
              onRetry={handleReset}
              onQuickRetry={handleQuickRetry}
              onClose={() => setOpen(false)}
            />
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
