"use client";

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    // Initialize state
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);
  // Removed 'matches' from dependency array to avoid loop/warning,
  // as we only want to subscribe on query change. The listener handles updates.

  return matches;
}
