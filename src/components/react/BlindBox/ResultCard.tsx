import { useMemo } from "react";
import { motion } from "motion/react";
import { ExternalLink, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Fic } from "@/types/fic";

const ERROR_MESSAGES = [
  "Hextech malfunction... The Undercity swallowed your fic.",
  "Even Vi's gauntlets couldn't punch through this one.",
  "The Hexgates are down. No fics getting through.",
  "Jinx got to the server first. Boom.",
];

interface ResultCardProps {
  fic: Fic | null;
  mood?: string | null;
  onRetry: () => void;
  onQuickRetry?: () => void;
  onClose: () => void;
}

export const ResultCard = ({ fic, mood, onRetry, onQuickRetry, onClose}: ResultCardProps) => {
  const errorMessage = useMemo(
    () => ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)],
    [],
  );

  if(!fic) {
    return (
      <motion.div
        initial={{opacity: 0, scale: 0.8}}
        animate={{opacity: 1, scale: 1}}
        exit={{ opacity: 0}}
        className="text-center py-8"
      >
        <span className="text-5xl mb-4 block"> 😢 </span>
        <h3 className="text-xl font-serif font-bold text-foreground mb-2">
          {errorMessage}
        </h3>
        <Button onClick={onRetry} variant='outline'>
          <RotateCcw size={16} /> Try Again
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{opacity: 0, scale: 0.8}}
      animate={{opacity: 1, scale: 1}}
      exit={{ opacity: 0}}
      className="text-center py-4"
    >
<motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="text-5xl mb-4"
      >
        🎉
      </motion.div>

      {/* 文章信息 */}
      <h3 className="text-xl font-serif font-bold text-foreground mb-1 line-clamp-2">
        {fic.title}
      </h3>
      <p className="text-accent text-sm mb-4">
        by {fic.author}
      </p>

      {/* 简介 */}
      <p className="text-muted-foreground text-sm line-clamp-3 mb-6 px-4">
        {fic.summary}
      </p>

      {/* 操作按钮 */}
      <div className="flex gap-3 justify-center">
        <Button onClick={onRetry} variant="outline" size="sm">
          <RotateCcw className="size-4 mr-2" />
          换个口味
        </Button>
        {onQuickRetry && mood && (
          <Button onClick={onQuickRetry} variant="outline" size="sm">
            <RotateCcw className="size-4 mr-2" />
            再来一次 {mood}
          </Button>
        )}
        <Button asChild size="sm" className="bg-linear-to-r from-accent to-primary">
          <a href={fic.link} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4 mr-2" />
            去看看！
          </a>
        </Button>
      </div>
    </motion.div>
  )
}
