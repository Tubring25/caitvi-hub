import { cn } from "@/lib/utils";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

const QUOTE_LINES = [
  "You're hot, cupcake",
  "Undercity's gonna eat you alive.",
  "Like a cupcake.",
  "Easy, easy, easy.",
  "It's been real, cupcake.",
  "What about us?",
  "Oil and water.",
  "Promise me you won't change.",
  "Mongoose?",
  "You really think I needed all the guards at the Hexgates?",
  "Sorry to say, you've grown a bit predictable."
]

export default function QuoteDisplay() {
  const [currentQuote, setCurrentQuote] = useState<string>(QUOTE_LINES[0]);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [displayedChars, setDisplayedChars] = useState<number>(0);
  const [targetQuote, setTargetQuote] = useState<string>("");

  useEffect(() => {
    const initial = QUOTE_LINES[Math.floor(Math.random() * QUOTE_LINES.length)];
    setCurrentQuote(initial);

    const mq = window.matchMedia("(pointer: coarse)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const getRandomQuote = useCallback(() => {
    let newQuote;
    do {
      newQuote = QUOTE_LINES[Math.floor(Math.random() * QUOTE_LINES.length)];
    } while (newQuote === currentQuote && QUOTE_LINES.length > 1);
    return newQuote;
  }, [currentQuote]);

  // Typewriter effect
  useEffect(() => {
    if (!targetQuote || !isAnimating) return;

    setDisplayedChars(0);
    setCurrentQuote(targetQuote);

    const len = targetQuote.length;
    let frame = 0;

    const interval = setInterval(() => {
      frame++;
      setDisplayedChars(frame);
      if (frame >= len) {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [targetQuote, isAnimating]);

  const handleInteraction = () => {
    if (isAnimating) return;

    if (!isRevealed) {
      setIsRevealed(true);
    }

    const next = getRandomQuote();
    setTargetQuote(next);
    setIsAnimating(true);
  }

  return (
    <div id="quote-display" className="mt-2 h-20 sm:h-16 flex items-start">
      <div
        className={cn(
          "relative pl-0 pr-4 py-2 cursor-pointer select-none group",
          { "pointer-events-none": isAnimating }
        )}
        onMouseEnter={() => {
          if (!isMobile && !isRevealed) {
            handleInteraction();
          }
        }}
        onClick={handleInteraction}
      >
        <span
          className={cn(
            "relative inline-block font-serif italic text-[clamp(1.1rem,2vw+0.5rem,1.5rem)] leading-relaxed text-white/90 transition-all duration-700 ease-in-out",
            {
              "blur-0 opacity-100": isRevealed,
              "blur-xs opacity-70": !isRevealed,
            }
          )}
        >
          <span className="text-primary/60 text-2xl font-serif mr-1 align-top leading-none">&ldquo;</span>
          {isAnimating ? (
            <>
              <span>{currentQuote.slice(0, displayedChars)}</span>
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="inline-block w-[2px] h-[1.1em] bg-[#D462A6]/70 align-middle ml-px"
              />
            </>
          ) : (
            <span>{currentQuote}</span>
          )}
          <AnimatePresence>
            {!isAnimating && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-primary/60 text-2xl font-serif ml-1 align-bottom leading-none"
              >
                &rdquo;
              </motion.span>
            )}
          </AnimatePresence>
        </span>

        {/* Click hint */}
        {isRevealed && !isAnimating && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="absolute -bottom-4 left-0 text-[10px] uppercase tracking-[0.3em] text-white/20 font-sans"
          >
            tap for another
          </motion.span>
        )}
      </div>
    </div>
  )
}
