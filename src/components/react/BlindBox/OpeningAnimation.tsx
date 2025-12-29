import { motion } from "motion/react";
import type { BlindBoxMood } from "./index";
import { DogIcon, CakeIcon } from "lucide-react";

interface OpeningAnimationProps {
  mood: BlindBoxMood;
}

export const OpeningAnimation = ({ mood }: OpeningAnimationProps) => {
  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
      className="flex flex-col items-center justify-center py-12"
    >
      <motion.div
        animate={{rotateY: [0, 720], y: [0, -30, 0, 20, 0], scale: [1, 1.2, 1]}}
        transition={{duration: 2.5, ease: "circOut", times: [0, 1]}}
        className="w-28 h-28 items-center justify-center text-6xl"
      >
        <div 
            className="absolute inset-0 rounded-full border-4 border-[#D4AF37] bg-[#1a1a1a] shadow-[0_0_30px_#D4AF37] flex items-center justify-center backface-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="absolute inset-1 rounded-full border border-[#D4AF37]/50 border-dashed" />
            <img src="/images/kiramman_crest.png" alt="Kiramman Crest" className="w-3/4 h-3/4 object-contain opacity-90 drop-shadow-[0_0_10px_#D4AF37]" />
          </div>
      </motion.div>
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5]}}
        transition={{duration:1.5, repeat: Infinity, ease: "easeInOut"}}
        className="mt-8 text-foreground font-mono text-sm"
      >
        What are we now?
      </motion.p>
    </motion.div>
  )
}
