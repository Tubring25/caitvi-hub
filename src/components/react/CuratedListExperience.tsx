import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, useReducedMotion } from "motion/react";

import type { Fic } from "@/types/fic";

type CuratedItem = {
  fic: Fic;
  curatorComment: string | null;
};

type CuratedListExperienceProps = {
  list: {
    title: string;
    description: string | null;
  };
  items: CuratedItem[];
};

function formatWords(words: number): string {
  if (words < 1_000) return `${words} words`;
  return `${(words / 1_000).toFixed(words >= 10_000 ? 0 : 1)}k words`;
}

function formatReadTime(words: number): string {
  const minutes = Math.max(1, Math.ceil(words / 250));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours} hr` : `${hours} hr ${remainder} min`;
}

export default function CuratedListExperience({
  list,
  items,
}: CuratedListExperienceProps) {
  const scrollerRef = useRef<HTMLElement>(null);
  const markerRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndexRef = useRef(0);
  const isInListRef = useRef(false);
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [suppressedFocusIndex, setSuppressedFocusIndex] = useState<number | null>(null);
  const [isInList, setIsInList] = useState(false);

  const totalWords = items.reduce((total, item) => total + item.fic.stats.words, 0);
  const selectedItem = selectedIndex === null ? null : items[selectedIndex];

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    let frameId: number | null = null;

    const updateScrollState = () => {
      frameId = null;

      const nextIsInList = root.scrollTop > root.clientHeight * 0.9;
      if (nextIsInList !== isInListRef.current) {
        isInListRef.current = nextIsInList;
        setIsInList(nextIsInList);
      }

      const rootCenter = root.getBoundingClientRect().top + root.clientHeight / 2;
      let nextActiveIndex = activeIndexRef.current;
      let nearestDistance = Number.POSITIVE_INFINITY;

      markerRefs.current.forEach((marker, index) => {
        if (!marker) return;
        const distance = Math.abs(marker.getBoundingClientRect().top - rootCenter);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nextActiveIndex = index;
        }
      });

      if (nextActiveIndex !== activeIndexRef.current) {
        activeIndexRef.current = nextActiveIndex;
        setActiveIndex(nextActiveIndex);
      }
    };

    const handleScroll = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateScrollState);
    };

    updateScrollState();
    root.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      root.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [items.length]);

  const handleItemClick = (index: number): void => {
    activeIndexRef.current = index;
    setActiveIndex(index);
    setSuppressedFocusIndex(null);
    setSelectedIndex(index);
  };

  const handleDialogChange = (open: boolean): void => {
    if (!open) setSelectedIndex(null);
  };

  return (
    <main
      ref={scrollerRef}
      className={`curated-experience${selectedItem ? " is-detail-open" : ""}`}
    >
      <a className="curated-back" href="/lists">
        <span aria-hidden="true">←</span>
        All favorites
      </a>

      <section className="curated-cover" aria-labelledby="curated-list-title">
        <div className="curated-cover__inner">
          <p className="curated-cover__eyebrow">From my favorites</p>
          <h1 id="curated-list-title">{list.title}</h1>
          {list.description && <p className="curated-cover__description">{list.description}</p>}
          <div className="curated-cover__meta" aria-label="Collection statistics">
            <span>{items.length} stories</span>
            <span>{formatWords(totalWords)}</span>
            <span>{formatReadTime(totalWords)}</span>
          </div>
          <p className="curated-scroll-hint">
            <span aria-hidden="true">↓</span>
            Scroll through the list
          </p>
        </div>
      </section>

      {items.length > 0 ? (
        <section className="curated-sequence" aria-label={`${list.title} stories`}>
          <div
            className={`curated-focus-line${isInList ? " is-visible" : ""}`}
            aria-hidden="true"
          >
            <span className="curated-focus-line__count">
              {String(activeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </span>
            <span className="curated-focus-line__action">Open story</span>
          </div>

          <ol className="curated-story-list">
            {items.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <li className="curated-story" key={item.fic.id}>
                  <span
                    ref={(node) => {
                      markerRefs.current[index] = node;
                    }}
                    className="curated-focus-marker"
                    data-index={index}
                    aria-hidden="true"
                  />
                  <button
                    ref={(node) => {
                      buttonRefs.current[index] = node;
                    }}
                    type="button"
                    className={`curated-story__button${isActive ? " is-active" : ""}${suppressedFocusIndex === index ? " is-focus-returned" : ""}`}
                    onClick={() => handleItemClick(index)}
                    onFocus={() => {
                      activeIndexRef.current = index;
                      setActiveIndex(index);
                    }}
                    onBlur={() => {
                      setSuppressedFocusIndex((currentIndex) =>
                        currentIndex === index ? null : currentIndex,
                      );
                    }}
                    aria-current={isActive ? "true" : undefined}
                    aria-label={`Open ${item.fic.title}`}
                  >
                    <span className="curated-story__number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="curated-story__title">
                      {item.fic.title}
                    </span>
                    <span className="curated-story__author">by {item.fic.author}</span>
                    <span className="curated-story__meta">
                      {item.fic.rating} · {formatWords(item.fic.stats.words)} · {item.fic.status}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      ) : (
        <section className="curated-empty">
          <p>Nothing saved here yet.</p>
          <a href="/lists">Back to all favorites</a>
        </section>
      )}

      <footer className="curated-end">
        <p>End of collection</p>
        <a href="/lists">Choose another list</a>
      </footer>

      <Dialog.Root open={selectedItem !== null} onOpenChange={handleDialogChange}>
        {selectedItem && selectedIndex !== null && (
          <Dialog.Portal>
            <Dialog.Overlay asChild>
              <motion.div
                className="curated-dialog__overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content
              className="curated-dialog"
              onEscapeKeyDown={() => {
                setSuppressedFocusIndex(selectedIndex);
              }}
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                buttonRefs.current[selectedIndex]?.focus({ preventScroll: true });
              }}
            >
              <motion.div
                className="curated-dialog__inner"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.42, ease: [0.16, 1, 0.3, 1] }}
              >
                <Dialog.Close className="curated-dialog__close" aria-label="Close story details">
                  <span aria-hidden="true">×</span>
                </Dialog.Close>

                <section className="curated-dialog__page curated-dialog__page--title">
                  <span className="curated-dialog__index">
                    {String(selectedIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                  </span>
                  <div className="curated-dialog__frame" aria-hidden="true" />
                  <div className="curated-dialog__heading">
                    <p className="curated-dialog__rating">{selectedItem.fic.rating}</p>
                    <Dialog.Title asChild>
                      <h2>{selectedItem.fic.title}</h2>
                    </Dialog.Title>
                    <p className="curated-dialog__author">by {selectedItem.fic.author}</p>
                    {selectedItem.fic.quote && (
                      <blockquote>“{selectedItem.fic.quote}”</blockquote>
                    )}
                    <Dialog.Description className="curated-dialog__metadata">
                      {selectedItem.fic.status} · {formatWords(selectedItem.fic.stats.words)} · {formatReadTime(selectedItem.fic.stats.words)}
                    </Dialog.Description>
                  </div>
                </section>

                <section className="curated-dialog__page curated-dialog__page--content">
                  <div className="curated-dialog__body">
                    <div className="curated-dialog__reading">
                      {selectedItem.curatorComment && (
                        <section>
                          <h3>Why I keep it</h3>
                          <p className="curated-dialog__curator-note">{selectedItem.curatorComment}</p>
                        </section>
                      )}

                      <section>
                        <h3>About this story</h3>
                        <p className="curated-dialog__summary">
                          {selectedItem.fic.summary.replace(/\\n/g, "\n") ||
                            "No archive summary is available."}
                        </p>
                      </section>
                    </div>

                    <aside className="curated-dialog__aside">
                      <div>
                        <h3>Reading signals</h3>
                        <ul className="curated-signal-list">
                          {selectedItem.fic.contentSignals.length > 0 ? (
                            selectedItem.fic.contentSignals.map((signal) => (
                              <li key={signal}>{signal.replaceAll("_", " ")}</li>
                            ))
                          ) : (
                            <li>Not yet classified</li>
                          )}
                        </ul>
                      </div>

                      <div className="curated-dialog__links">
                        <a
                          className="curated-dialog__primary-link"
                          href={selectedItem.fic.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Read on AO3 <span aria-hidden="true">↗</span>
                        </a>
                        <a href={`/fic/${selectedItem.fic.id}`}>View full details</a>
                      </div>
                    </aside>
                  </div>
                </section>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </Dialog.Root>
    </main>
  );
}
