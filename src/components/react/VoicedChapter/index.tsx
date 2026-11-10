import { useCallback, useEffect, useMemo, useRef } from "react";
import type { MouseEvent } from "react";
import { useReducedMotion } from "motion/react";

import { VoiceDock } from "./VoiceDock";
import { useVoicePlayer } from "@/hooks/use-voice-player";
import type { VoiceClip } from "@/types/work";

interface VoicedChapterProps {
  /** Chapter HTML from `renderChapter`, with voiced lines marked up as `.voice-line`. */
  html: string;
  clips: VoiceClip[];
  lang: string;
}

export default function VoicedChapter({ html, clips, lang }: VoicedChapterProps) {
  const articleRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const findLine = useCallback((index: number): HTMLElement | null => {
    return articleRef.current?.querySelector<HTMLElement>(`[data-voice-index="${index}"]`) ?? null;
  }, []);

  const player = useVoicePlayer(clips);
  const { activeIndex, status } = player;

  // Play-through and the dock's skip buttons can move to a line that is off
  // screen (or tucked under the header or dock); bring it into view.
  useEffect(() => {
    if (activeIndex === null) return;
    const line = findLine(activeIndex);
    if (!line) return;
    const bounds = line.getBoundingClientRect();
    const isVisible = bounds.top >= 96 && bounds.bottom <= window.innerHeight - 128;
    if (!isVisible) {
      line.scrollIntoView({ block: "center", behavior: shouldReduceMotion ? "auto" : "smooth" });
    }
  }, [activeIndex, findLine, shouldReduceMotion]);

  // The prose is server-rendered HTML, so playback state is mirrored onto it by hand.
  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;

    article.querySelectorAll<HTMLElement>(".voice-line").forEach((line) => {
      const index = Number(line.dataset.voiceIndex);
      const clip = clips[index];
      const isActive = index === activeIndex && status !== "idle";
      const isSounding = isActive && (status === "playing" || status === "loading");

      if (isActive) line.dataset.state = status;
      else delete line.dataset.state;

      const button = line.querySelector("button");
      if (button && clip) {
        button.setAttribute(
          "aria-label",
          isSounding
            ? `Pause ${clip.speaker}’s line`
            : `Play this line, voiced as ${clip.speaker}`,
        );
      }
    });
  }, [activeIndex, status, clips]);

  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    const target = event.target as Element;
    if (target.closest("a")) return;

    const line = target.closest<HTMLElement>(".voice-line");
    if (!line) return;

    // Dragging across a line to select its text should not start playback.
    const isButton = target.closest(".voice-line__btn") !== null;
    if (!isButton && window.getSelection()?.toString()) return;

    player.toggle(Number(line.dataset.voiceIndex));
  };

  const markup = useMemo(() => ({ __html: html }), [html]);

  return (
    <>
      <article
        ref={articleRef}
        className="reader-prose"
        lang={lang}
        onClick={clips.length > 0 ? handleClick : undefined}
        dangerouslySetInnerHTML={markup}
      />
      {clips.length > 0 && (
        <VoiceDock
          clips={clips}
          activeIndex={activeIndex}
          status={status}
          isPlayThrough={player.isPlayThrough}
          progressRef={player.progressRef}
          onPlayPause={player.playPause}
          onPrevious={player.previous}
          onNext={player.next}
          onPlayThroughChange={player.setPlayThrough}
        />
      )}
    </>
  );
}
