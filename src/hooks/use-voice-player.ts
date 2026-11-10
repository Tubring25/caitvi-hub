import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import type { VoiceClip } from "@/types/work";

export type VoiceStatus = "idle" | "loading" | "playing" | "paused" | "error";

type VoicePlayer = {
  activeIndex: number | null;
  status: VoiceStatus;
  isPlayThrough: boolean;
  progressRef: RefObject<HTMLDivElement | null>;
  toggle: (index: number) => void;
  playPause: () => void;
  previous: () => void;
  next: () => void;
  setPlayThrough: (value: boolean) => void;
};

/**
 * Plays a chapter's voice clips through one shared audio element.
 *
 * One element matters: browsers only allow playback that starts from a user
 * gesture, and reusing the element the reader already started is what lets
 * play-through continue to the next line without another tap.
 */
export function useVoicePlayer(clips: VoiceClip[]): VoicePlayer {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const activeIndexRef = useRef<number | null>(null);
  const statusRef = useRef<VoiceStatus>("idle");
  const isPlayThroughRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [status, setStatusState] = useState<VoiceStatus>("idle");
  const [isPlayThrough, setIsPlayThrough] = useState(false);

  const setStatus = useCallback((next: VoiceStatus): void => {
    statusRef.current = next;
    setStatusState(next);
  }, []);

  const start = useCallback(
    (index: number): void => {
      const audio = audioRef.current;
      const clip = clips[index];
      if (!audio || !clip) return;

      activeIndexRef.current = index;
      setActiveIndex(index);
      setStatus("loading");
      if (progressRef.current) progressRef.current.style.transform = "scaleX(0)";

      audio.src = clip.src;
      audio.play().catch((error: unknown) => {
        // Switching lines mid-load rejects the earlier play() with AbortError; that is not a failure.
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (activeIndexRef.current === index) setStatus("error");
      });
    },
    [clips, setStatus],
  );

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    const handlePlaying = (): void => setStatus("playing");
    const handleWaiting = (): void => {
      if (statusRef.current === "playing") setStatus("loading");
    };
    const handlePause = (): void => {
      // Ending and switching clips also fire `pause`; only a real pause should show as one.
      if (!audio.ended && statusRef.current === "playing") setStatus("paused");
    };
    const handleError = (): void => {
      if (activeIndexRef.current !== null) setStatus("error");
    };
    const handleEnded = (): void => {
      const current = activeIndexRef.current;
      const nextIndex = current === null ? null : current + 1;
      if (isPlayThroughRef.current && nextIndex !== null && nextIndex < clips.length) {
        start(nextIndex);
        return;
      }
      setStatus("idle");
      if (progressRef.current) progressRef.current.style.transform = "scaleX(0)";
    };

    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audio.removeAttribute("src");
      audioRef.current = null;
    };
  }, [clips.length, setStatus, start]);

  // The progress bar is written straight to the DOM so a short clip animates
  // smoothly without re-rendering the chapter sixty times a second.
  useEffect(() => {
    if (status !== "playing") return;
    let frameId = 0;
    const tick = (): void => {
      const audio = audioRef.current;
      const bar = progressRef.current;
      if (audio && bar && audio.duration > 0 && Number.isFinite(audio.duration)) {
        bar.style.transform = `scaleX(${Math.min(1, audio.currentTime / audio.duration)})`;
      }
      frameId = window.requestAnimationFrame(tick);
    };
    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [status]);

  const toggle = useCallback(
    (index: number): void => {
      const audio = audioRef.current;
      if (!audio) return;

      if (index === activeIndexRef.current) {
        if (statusRef.current === "playing" || statusRef.current === "loading") {
          audio.pause();
          if (statusRef.current === "loading") setStatus("paused");
          return;
        }
        if (statusRef.current === "paused") {
          audio.play().catch(() => setStatus("error"));
          return;
        }
      }
      start(index);
    },
    [setStatus, start],
  );

  const playPause = useCallback((): void => {
    toggle(activeIndexRef.current ?? 0);
  }, [toggle]);

  const previous = useCallback((): void => {
    const current = activeIndexRef.current;
    if (current !== null && current > 0) start(current - 1);
  }, [start]);

  const next = useCallback((): void => {
    const current = activeIndexRef.current;
    const target = current === null ? 0 : current + 1;
    if (target < clips.length) start(target);
  }, [clips.length, start]);

  const setPlayThrough = useCallback((value: boolean): void => {
    isPlayThroughRef.current = value;
    setIsPlayThrough(value);
  }, []);

  return {
    activeIndex,
    status,
    isPlayThrough,
    progressRef,
    toggle,
    playPause,
    previous,
    next,
    setPlayThrough,
  };
}
