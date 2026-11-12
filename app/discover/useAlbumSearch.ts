import { useEffect, useState } from "react";
import type { Album } from "@/lib/types";

// What GET /api/albums/search sends back for each album (see lib/spotify.ts)
type SpotifyAlbum = {
  spotifyId: string;
  name: string;
  artist: string;
  releaseYear: string | null;
  coverUrl: string | null;
};

export type SearchStatus = "idle" | "loading" | "done" | "error";

// Searches Spotify albums through our API as the user types.
// Same logic as app/search/SearchBox.tsx, packaged so any screen can use it.
export function useAlbumSearch(query: string) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");

  useEffect(() => {
    const q = query.trim();
    if (!q) return;

    // Wait until the user stops typing, so we stay under Spotify's rate limit.
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setStatus("loading");
      try {
        const res = await fetch(`/api/albums/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("search failed");
        const data: { albums?: SpotifyAlbum[] } = await res.json();
        setAlbums((data.albums ?? []).map(toAlbum));
        setStatus("done");
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setStatus("error");
      }
    }, 500);

    // Runs when the query changes again: cancel the old timer and request.
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return { albums, status };
}

// Turns Spotify's shape into the Album type our AlbumCard already uses.
function toAlbum(a: SpotifyAlbum): Album {
  return {
    id: a.spotifyId,
    title: a.name,
    artist: a.artist,
    year: a.releaseYear ? Number(a.releaseYear) : undefined,
    coverUrl: a.coverUrl ?? undefined,
    source: "spotify",
  };
}
