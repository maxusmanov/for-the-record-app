"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import BottomNav from "../components/BottomNav";
import PageTransition from "../components/PageTransition";
import SearchBar from "../components/SearchBar";
import StarRating from "../components/StarRating";
import { placeholderGradient } from "../components/placeholderGradient";
import { useAlbumSearch } from "../discover/useAlbumSearch";
import { MAX_STARS, toRatingInput } from "@/lib/ratings";
import { useRatings } from "@/lib/useRatings";
import type { Album } from "@/lib/types";
import styles from "./rate.module.css";

const MAX_REVIEW = 2000;

type RateViewProps = {
  // an album that was already picked on the discover page
  initialAlbum: Album | null;
  // a search to start with, for albums that still need matching on Spotify
  initialQuery: string;
};

// Step 1: find an album. Step 2: give it stars and write about it.
export default function RateView({ initialAlbum, initialQuery }: RateViewProps) {
  const [album, setAlbum] = useState<Album | null>(initialAlbum);
  const [query, setQuery] = useState(initialQuery);
  // What the user typed or tapped for this album. Anything they haven't
  // changed falls back to the rating they saved before.
  const [draft, setDraft] = useState<{ stars?: number; review?: string }>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { ratings, rate, saveFailed } = useRatings();
  const { albums: results, status } = useAlbumSearch(query);
  const searching = query.trim() !== "";

  const existing = album ? ratings.find((r) => r.spotifyAlbumId === album.id) : undefined;
  const stars = draft.stars ?? existing?.rating ?? 0;
  const review = draft.review ?? existing?.review ?? "";

  function pick(next: Album | null) {
    setAlbum(next);
    setDraft({});
    setSaved(false);
  }

  async function save() {
    if (!album || stars === 0) return;
    setSaving(true);
    const ok = await rate(toRatingInput(album, stars, review.trim() || null));
    setSaving(false);
    setSaved(ok);
  }

  return (
    <PageTransition>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>rate</h1>
        </header>

        {saved && album ? (
          <div className={styles.panel} role="status">
            <p className={styles.panelTitle}>saved</p>
            <p className={styles.hint}>
              {album.title} is on your profile with {stars} {stars === 1 ? "star" : "stars"}
            </p>
            <div className={styles.actions}>
              <Link href="/profile" transitionTypes={["nav-forward"]} className={styles.primary}>
                view your profile
              </Link>
              <button type="button" className={styles.secondary} onClick={() => pick(null)}>
                rate another album
              </button>
            </div>
          </div>
        ) : album ? (
          <>
            <section className={styles.picked}>
              <div className={styles.cover} style={{ background: placeholderGradient(album.id) }}>
                {album.coverUrl && (
                  <Image src={album.coverUrl} alt="" fill sizes="96px" className={styles.image} />
                )}
              </div>
              <div className={styles.pickedInfo}>
                <h2 className={styles.albumTitle}>{album.title}</h2>
                <p className={styles.albumArtist}>{album.artist}</p>
                {album.year && <p className={styles.albumMeta}>{album.year}</p>}
                <button type="button" className={styles.change} onClick={() => pick(null)}>
                  change album
                </button>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.heading}>
                {existing ? "your rating" : "how was it?"}
              </h2>
              <StarRating
                value={stars}
                onChange={(n) => setDraft({ ...draft, stars: n })}
                size="md"
                label={`your rating out of ${MAX_STARS}`}
              />
            </section>

            <section className={styles.section}>
              <h2 className={styles.heading}>review</h2>
              <textarea
                className={styles.textarea}
                value={review}
                onChange={(e) => setDraft({ ...draft, review: e.target.value })}
                placeholder="add a review (optional)"
                maxLength={MAX_REVIEW}
                rows={5}
                aria-label="review"
              />
              <p className={styles.count}>{review.length} / {MAX_REVIEW}</p>
            </section>

            {saveFailed && (
              <p className={styles.error} role="alert">
                could not save, try again
              </p>
            )}
            <button
              type="button"
              className={styles.primary}
              onClick={save}
              disabled={stars === 0 || saving}
            >
              {saving ? "saving…" : existing ? "update" : "save"}
            </button>
            {stars === 0 && <p className={styles.hint}>pick a star rating to save</p>}
          </>
        ) : (
          <>
            <p className={styles.lead}>what did you listen to?</p>
            <SearchBar value={query} onChange={setQuery} placeholder="search for an album" />

            {searching && (
              <section className={styles.results} aria-live="polite">
                {status === "loading" && results.length === 0 && (
                  <p className={styles.hint}>searching…</p>
                )}
                {status === "error" && (
                  <p className={styles.error} role="alert">could not load results, try again</p>
                )}
                {status === "done" && results.length === 0 && (
                  <p className={styles.hint}>nothing matches “{query.trim()}”</p>
                )}
                {status !== "error" && results.length > 0 && (
                  <ul className={styles.list}>
                    {results.map((a) => (
                      <li key={a.id}>
                        <button type="button" className={styles.result} onClick={() => pick(a)}>
                          <span
                            className={styles.thumb}
                            style={{ background: placeholderGradient(a.id) }}
                          >
                            {a.coverUrl && (
                              <Image src={a.coverUrl} alt="" fill sizes="56px" className={styles.image} />
                            )}
                          </span>
                          <span className={styles.resultText}>
                            <span className={styles.resultTitle}>{a.title}</span>
                            <span className={styles.resultMeta}>
                              {a.artist}
                              {a.year ? ` · ${a.year}` : ""}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </>
        )}
      </main>
      <BottomNav active="rate" />
    </PageTransition>
  );
}
