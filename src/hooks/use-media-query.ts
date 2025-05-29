import { useState, useEffect } from "react";

/**
 * Custom hook that returns a boolean indicating if the media query matches
 * @param query The media query to match
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    // Check if window is available (client-side)
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    // Default to false on server-side
    return false;
  });

  useEffect(() => {
    // Return early if window is not available
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(query);

    // Update matches state when the media query changes
    const updateMatches = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Set initial value
    setMatches(mediaQuery.matches);

    // Add event listener using the modern API
    mediaQuery.addEventListener("change", updateMatches);

    // Clean up the listener on unmount
    return () => {
      mediaQuery.removeEventListener("change", updateMatches);
    };
  }, [query]);

  return matches;
}
