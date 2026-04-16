import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface RedactedSummaryProps {
  summary: string;
  dropCapColor?: string;
}

export default function RedactedSummary({ summary, dropCapColor = "rgba(255,255,255,0.8)" }: RedactedSummaryProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div>
      <div
        onClick={() => !revealed && setRevealed(true)}
        className={cn(
          "relative rounded-lg overflow-hidden transition-all duration-500",
          !revealed && "cursor-pointer hover:bg-[#D462A6]/[0.02]"
        )}
      >
        {/* Scanline overlay */}
        {!revealed && (
          <div
            className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-800"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 6px)`,
            }}
          />
        )}

        {/* Restricted stamp */}
        <motion.div
          className="absolute top-1/2 left-1/2 z-20 pointer-events-none font-mono text-sm font-bold uppercase tracking-[0.4em] text-[rgba(200,50,50,0.2)] border-[2.5px] border-[rgba(200,50,50,0.12)] rounded px-5 py-2 whitespace-nowrap"
          style={{ x: "-50%", y: "-50%", rotate: -12 }}
          animate={
            revealed
              ? { opacity: 0, scale: 1.5 }
              : { opacity: 1, scale: 1 }
          }
          transition={{ duration: 0.5 }}
        >
          Restricted
        </motion.div>

        {/* Summary content */}
        <motion.div
          className="py-4 px-5 select-none"
          animate={{ filter: revealed ? "blur(0px)" : "blur(6px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={revealed ? { userSelect: "auto" } : {}}
        >
          <p
            className="summary-dropcap text-[16px] leading-[1.9] text-white/75 font-serif whitespace-pre-line"
            style={{ "--drop-cap-color": dropCapColor } as React.CSSProperties}
          >
            {summary}
          </p>
        </motion.div>
      </div>

      {!revealed && (
        <p className="text-[11px] text-white/30 italic text-center mt-2">
          Click to declassify
        </p>
      )}
    </div>
  );
}
