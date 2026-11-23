"use client";

import { useState } from "react";
import Link from "next/link";
import SearchBar from "../components/SearchBar";
import AlbumCard from "../components/AlbumCard";
import ArtistCard from "../components/ArtistCard";
import BottomNav from "../components/BottomNav";
import PageTransition from "../components/PageTransition";
import type { Album, Artist } from "@/lib/types";
import { useAlbumSearch } from "./useAlbumSearch";
import { useRatings } from "@/lib/useRatings";
import { toRatingInput } from "@/lib/ratings";
import styles from "./page.module.css";

type DiscoverProps = {
  // both come from the server (see page.tsx)
  albums: Album[];
  artists: Artist[];
};

export default function Discover({ albums, artists }: DiscoverProps) {
  const [query, setQuery] = useState("");
  const { albums: results, status } = useAlbumSearch(query);
  const searching = query.trim() !== "";
  // trending albums come from Apple, so only Spotify search results can be rated
  const { ratingOf, rate, saveFailed } = useRatings();

  return (
    <PageTransition>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>for the record</h1>
          <button type="button" className={styles.bell} aria-label="notifications" />
        </header>

        <nav className={styles.tabs} aria-label="feeds">
          <Link href="/home" className={styles.tab}>following</Link>
          <span className={`${styles.tab} ${styles.activeTab}`} aria-current="page">discover</span>
        </nav>

        <SearchBar value={query} onChange={setQuery} placeholder="search albums" />

        {searching ? (
          // typing: show Spotify results
          <section className={styles.section} aria-live="polite">
            {status === "loading" && results.length === 0 && (
              <p className={styles.message}>searching…</p>
            )}
            {status === "error" && (
              <div className={styles.empty} role="alert">
                <p className={styles.emptyTitle}>could not load results</p>
                <p className={styles.emptyHint}>check your connection and try again</p>
              </div>
            )}
            {status === "done" && results.length === 0 && (
              <div className={styles.empty} role="status">
                <p className={styles.emptyTitle}>nothing matches “{query.trim()}”</p>
                <p className={styles.emptyHint}>try another album or artist</p>
              </div>
            )}
            {status !== "error" && results.length > 0 && (
              <div className={styles.grid}>
                {results.map((album) => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    userRating={ratingOf(album.id)}
                    onRate={(stars) => rate(toRatingInput(album, stars))}
                  />
                ))}
              </div>
            )}
            {saveFailed && (
              <p className={styles.message} role="alert">
                could not save your rating, try again
              </p>
            )}
          </section>
        ) : (
          // not typing: show what's popular on Apple Music right now
          <>
            {albums.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.heading}>trending albums</h2>
                <div className={styles.row}>
                  {albums.map((album) => (
                    <AlbumCard key={album.id} album={album} />
                  ))}
                </div>
              </section>
            )}

            {artists.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.heading}>trending artists</h2>
                <div className={styles.row}>
                  {artists.map((artist) => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <BottomNav active="search" />
    </PageTransition>
  );
}
