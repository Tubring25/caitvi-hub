import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const QUOTE_LINES = [
  "You’re hot, cupcake",
  "Undercity’s gonna eat you alive.",
  "Like a cupcake.",
  "Easy, easy, easy.",
  "It’s been real, cupcake.",
  "What about us?",
  "Oil and water.",
  "Promise me you won’t change.",
  "Mongoose?",
  "You really think I needed all the guards at the Hexgates?",
  "Sorry to say, you’ve grown a bit predictable."
]

export default function QuoteDisplay() {
  const [currentQuote, setCurrentQuote] = useState<string>(QUOTE_LINES[0]);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    setCurrentQuote(QUOTE_LINES[Math.floor(Math.random() * QUOTE_LINES.length)]);

    // TODO: check mobile should be in a global hook
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    }

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    }
  }, []);

  const getRandomQuote = () => {
    let newQuote;
    do {
      newQuote = QUOTE_LINES[Math.floor(Math.random() * QUOTE_LINES.length)];
    } while (newQuote === currentQuote && QUOTE_LINES.length > 1);
    return newQuote;
  }

  const handleInteraction = () => {
    if (!isRevealed) {
      setIsRevealed(true);
      setCurrentQuote(getRandomQuote());
    } else {
      setCurrentQuote(getRandomQuote());
    }
  }


  return (
    <div id="quote-display" className="mt-4 max-w-2xl mx-auto min-h-24 flex items-center justify-center">
      <div
        className={cn(
          "relative px-4 py-2 text-lg md:text-lg text-slate-200 leading-relaxed italic font-medium",
          "bg-black/10 backdrop-blur-sm rounded cursor-pointer select-none transition-transform duration-300",
          {
            "hover:scale-105": isRevealed,
          }
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
            "relative inline-block transition-all duration-700 ease-in-out",
            {
              "blur-0 opacity-100": isRevealed,
              "blur-xs opacity-80": !isRevealed,
            }
          )}
          style={{ textShadow: isRevealed ? "0 0 8px rgba(255, 255, 255, 0.3)" : "none"}}
        >
          &quot;{currentQuote}&quot;
        </span>

      </div>
    </div>
  )
}