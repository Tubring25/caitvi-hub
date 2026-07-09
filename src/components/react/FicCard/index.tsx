import { motion, useReducedMotion } from "motion/react";

import { FicCardFront } from "./FicCardFront";
import type { Fic } from "@/types/fic";

interface FicCardProps {
  fic: Fic;
}

export default function FicCard({ fic }: FicCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="relative z-0 h-[430px] w-full has-[details[open]]:z-30"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative h-full w-full">
        <FicCardFront fic={fic} />
      </div>
    </motion.div>
  );
}
