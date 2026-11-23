"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchRatings, saveRating } from "./ratings";
import type { Rating, RatingInput } from "./types";

export type RatingsStatus = "loading" | "ready" | "error";

// Loads the user's ratings and lets any screen save a new one or change one.
// The screen updates right away, and goes back if the save fails.
export function useRatings() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [status, setStatus] = useState<RatingsStatus>("loading");
  const [saveFailed, setSaveFailed] = useState(false);

  // lets rate() see the latest ratings without being rebuilt every time
  const latest = useRef<Rating[]>([]);
  useEffect(() => {
    latest.current = ratings;
  }, [ratings]);

  useEffect(() => {
    let cancelled = false;
    fetchRatings()
      .then((loaded) => {
        if (cancelled) return;
        setRatings(loaded);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const ratingOf = useCallback(
    (spotifyAlbumId: string) =>
      ratings.find((r) => r.spotifyAlbumId === spotifyAlbumId)?.rating ?? 0,
    [ratings],
  );

  const rate = useCallback(async (input: RatingInput) => {
    const id = input.spotifyAlbumId;
    const before = latest.current.find((r) => r.spotifyAlbumId === id);
    setSaveFailed(false);

    // show the new stars straight away
    const guess: Rating = { id, ratedAt: new Date().toISOString(), ...input };
    setRatings((current) => [guess, ...current.filter((r) => r.spotifyAlbumId !== id)]);

    try {
      const saved = await saveRating(input, Boolean(before));
      setRatings((current) => current.map((r) => (r.spotifyAlbumId === id ? saved : r)));
    } catch {
      // put things back the way they were
      setRatings((current) => {
        const rest = current.filter((r) => r.spotifyAlbumId !== id);
        return before ? [before, ...rest] : rest;
      });
      setSaveFailed(true);
    }
  }, []);

  return { ratings, status, ratingOf, rate, saveFailed };
}
