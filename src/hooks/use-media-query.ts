import { useState, useEffect } from "react";

/**
 * Check if the current window size matches the target query.
 * @param query - The media query to use. ex: "(max-width: 768px)"
 * @returns True if the media query matches current window size.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    if(media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [matches, query])

  return matches;
}