import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from 'motion/react';
import { FicCardFront } from "./FicCardFront";
import { FicCardBack } from "./FicCardBack";
import type { Fic, ReadingStatus } from "@/types/fic";

interface FicCardProps {
  fic: Fic;
  readingStatus?: ReadingStatus;
  onStatusChange?: (status: ReadingStatus) => void;
}

export default function FicCard({ fic, readingStatus = "none", onStatusChange }: FicCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Tilt motion values
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  
  const springConfig = { stiffness: 150, damping: 20 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Tilt effect - stronger when not flipped
    const tiltStrength = isFlipped ? 3 : 10;
    const rotateXValue = (mouseY / (rect.height / 2)) * -tiltStrength;
    const rotateYValue = (mouseX / (rect.width / 2)) * tiltStrength;
    
    rotateX.set(rotateXValue);
    rotateY.set(rotateYValue);
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  };

  const handleFlip = () => setIsFlipped(!isFlipped);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="w-full h-[460px]"
      style={{ perspective: 1500 }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Outer wrapper for tilt effect */}
      <motion.div
        className="w-full h-full"
        style={{
          rotateX: rotateXSpring,
          rotateY: rotateYSpring,
          transformStyle: "preserve-3d"
        }}
      >
        {/* Inner wrapper for flip effect */}
        <motion.div
          className="w-full h-full relative cursor-pointer"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ 
            rotateY: isFlipped ? 180 : 0,
            z: isHovered ? 40 : 0
          }}
          transition={{ 
            rotateY: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
            z: { duration: 0.3 }
          }}
        >
          {/* Hover glow effect */}
          <motion.div
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute -inset-1 rounded-[27px] blur-lg -z-10"
            style={{
              background: "linear-gradient(135deg, rgba(255,59,92,0.4), rgba(212,98,166,0.3), rgba(239,118,39,0.2))"
            }}
          />

          {/* FRONT SIDE */}
          <FicCardFront fic={fic} onFlip={handleFlip} isHovered={isHovered} />

          {/* BACK SIDE */}
          <FicCardBack 
            fic={fic} 
            onFlip={handleFlip} 
            readingStatus={readingStatus} 
            onStatusChange={onStatusChange} 
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}