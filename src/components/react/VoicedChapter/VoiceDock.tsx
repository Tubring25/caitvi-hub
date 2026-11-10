import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import type { RefObject } from "react";

import type { VoiceStatus } from "@/hooks/use-voice-player";
import type { VoiceClip } from "@/types/work";

interface VoiceDockProps {
  clips: VoiceClip[];
  activeIndex: number | null;
  status: VoiceStatus;
  isPlayThrough: boolean;
  progressRef: RefObject<HTMLDivElement | null>;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onPlayThroughChange: (value: boolean) => void;
}

const pad = (value: number): string => String(value).padStart(2, "0");

export function VoiceDock({
  clips,
  activeIndex,
  status,
  isPlayThrough,
  progressRef,
  onPlayPause,
  onPrevious,
  onNext,
  onPlayThroughChange,
}: VoiceDockProps) {
  const clip = activeIndex === null ? null : clips[activeIndex];
  const isSounding = status === "playing" || status === "loading";
  const hasPrevious = activeIndex !== null && activeIndex > 0;
  const hasNext = activeIndex === null ? clips.length > 0 : activeIndex < clips.length - 1;

  return (
    <section className="voice-dock" aria-label="Voice player" data-tone={clip?.tone ?? "other"}>
      <div ref={progressRef} className="voice-dock__progress" aria-hidden="true" />
      <div className="voice-dock__inner">
        <div className="voice-dock__controls">
          <button
            type="button"
            className="voice-dock__button"
            onClick={onPrevious}
            disabled={!hasPrevious}
            aria-label="Previous voiced line"
          >
            <SkipBack aria-hidden="true" />
          </button>
          <button
            type="button"
            className="voice-dock__button voice-dock__button--primary"
            onClick={onPlayPause}
            aria-label={isSounding ? "Pause" : clip ? "Play" : "Play the first voiced line"}
          >
            {isSounding ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          </button>
          <button
            type="button"
            className="voice-dock__button"
            onClick={onNext}
            disabled={!hasNext}
            aria-label="Next voiced line"
          >
            <SkipForward aria-hidden="true" />
          </button>
        </div>

        <div className="voice-dock__caption" aria-live="polite">
          {clip && activeIndex !== null ? (
            <>
              <p className="voice-dock__speaker">
                {clip.speaker}
                <span>
                  {pad(activeIndex + 1)} / {pad(clips.length)}
                </span>
              </p>
              {status === "error" ? (
                <p className="voice-dock__text" data-kind="error">
                  This clip couldn’t be loaded.
                </p>
              ) : (
                <p className="voice-dock__text">{clip.text}</p>
              )}
            </>
          ) : (
            <>
              <p className="voice-dock__speaker">
                {clips.length} voiced {clips.length === 1 ? "line" : "lines"}
              </p>
              <p className="voice-dock__text" data-kind="hint">
                Tap an underlined line to hear it.
              </p>
            </>
          )}
        </div>

        <button
          type="button"
          className="voice-dock__toggle"
          aria-pressed={isPlayThrough}
          onClick={() => onPlayThroughChange(!isPlayThrough)}
          title="Keep going to the next voiced line when one ends"
        >
          Play through
        </button>
      </div>
    </section>
  );
}
