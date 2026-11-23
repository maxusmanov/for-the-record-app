"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Like on Letterboxd, a profile shows up to four favorite albums.
export const MAX_FAVORITES = 4;

// There is no favorites table or endpoint yet, so the picks are kept in this
// browser only. When the backend has one, load and save here instead.
const KEY = "ftr-mock-favorites";

function read(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(saved) ? saved.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

// The Spotify ids of the favorite albums, in the order they were picked.
export function useFavorites() {
  const [ids, setIds] = useState<string[]>([]);
  const latest = useRef<string[]>([]);

  useEffect(() => {
    // read after the first render, because the server has no browser storage
    const saved = read();
    latest.current = saved;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIds(saved);
  }, []);

  // adds the album, or removes it if it is already a favorite
  const toggle = useCallback((id: string) => {
    const current = latest.current;
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : current.length < MAX_FAVORITES
        ? [...current, id]
        : current;
    latest.current = next;
    setIds(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // storage can be blocked, the pick just won't be remembered
    }
  }, []);

  return { ids, toggle };
}
