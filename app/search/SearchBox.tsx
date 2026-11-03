"use client";

import { useEffect, useState } from "react";
import loginStyles from "../login/page.module.css";
import styles from "./search.module.css";

// Matches the response of GET /api/albums/search
type Album = {
  spotifyId: string;
  name: string;
  artist: string;
  releaseYear: string | null;
  coverUrl: string | null;
};

type Status = "idle" | "loading" | "done" | "error";

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [albums, setAlbums] = useState<Album[]>([]);
  const [status, setStatus] = useState<Status>("idle");

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
        const data = await res.json();
        setAlbums(data.albums ?? []);
        setStatus("done");
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setStatus("error");
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const hasQuery = query.trim() !== "";

  return (
    <>
      <input
        className={loginStyles.input}
        type="search"
        placeholder="search albums"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
        autoFocus
      />

      {hasQuery && status === "loading" && <p className={styles.message}>searching…</p>}
      {hasQuery && status === "error" && (
        <p className={loginStyles.error} role="alert">
          could not load results, try again
        </p>
      )}
      {hasQuery && status === "done" && albums.length === 0 && (
        <p className={styles.message}>no albums found</p>
      )}

      {hasQuery && status !== "error" && albums.length > 0 && (
        <ul className={styles.grid}>
          {albums.map((album) => (
            <li key={album.spotifyId} className={styles.card}>
              {album.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className={styles.cover} src={album.coverUrl} alt={`${album.name} cover`} />
              ) : (
                <div className={styles.cover} />
              )}
              <p className={styles.name}>{album.name}</p>
              <p className={styles.meta}>
                {album.artist}
                {album.releaseYear ? ` · ${album.releaseYear}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}