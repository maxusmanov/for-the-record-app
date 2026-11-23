"use client";

import { useState } from "react";
import Image from "next/image";
import Sheet from "../components/Sheet";
import { placeholderGradient } from "../components/placeholderGradient";
import { MAX_FAVORITES, useFavorites } from "@/lib/useFavorites";
import type { Rating } from "@/lib/types";
import styles from "./Favorites.module.css";

// Up to four favorite albums, shown as vinyl records.
// Press a record to flip it and reveal the album cover.
export default function Favorites({ ratings }: { ratings: Rating[] }) {
  const { ids, toggle } = useFavorites();
  const [flipped, setFlipped] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);

  // favorites are picked from rated albums, so every id matches a rating
  const favorites = ids
    .map((id) => ratings.find((r) => r.spotifyAlbumId === id))
    .filter((r): r is Rating => r !== undefined);
  const empty = Array.from({ length: MAX_FAVORITES - favorites.length });

  return (
    <section className={styles.section}>
      <div className={styles.headingRow}>
        <h2 className={styles.heading}>favorite albums</h2>
        <button type="button" className={styles.edit} onClick={() => setPicking(true)}>
          {favorites.length > 0 ? "edit" : "add"}
        </button>
      </div>

      <ul className={styles.grid}>
        {favorites.map((r) => {
          const isFlipped = flipped === r.spotifyAlbumId;
          return (
            <li key={r.spotifyAlbumId} className={styles.item}>
              <button
                type="button"
                className={styles.tile}
                aria-pressed={isFlipped}
                aria-label={`${r.albumName} by ${r.artistName}. ${isFlipped ? "show the record" : "show the cover"}`}
                onClick={() => setFlipped(isFlipped ? null : r.spotifyAlbumId)}
              >
                <span className={`${styles.flip} ${isFlipped ? styles.flipped : ""}`}>
                  <span className={styles.vinyl}>
                    <span className={styles.shine} />
                    <span
                      className={styles.label}
                      style={{
                        background: r.coverUrl
                          ? `url(${r.coverUrl}) center / cover`
                          : placeholderGradient(r.spotifyAlbumId),
                      }}
                    />
                    <span className={styles.hole} />
                  </span>
                  <span
                    className={styles.sleeve}
                    style={{ background: placeholderGradient(r.spotifyAlbumId) }}
                  >
                    {r.coverUrl && (
                      <Image src={r.coverUrl} alt="" fill sizes="90px" className={styles.cover} />
                    )}
                  </span>
                </span>
              </button>
              <p className={styles.name}>{r.albumName}</p>
            </li>
          );
        })}

        {empty.map((_, i) => (
          <li key={`empty-${i}`} className={styles.item}>
            <button
              type="button"
              className={styles.slot}
              onClick={() => setPicking(true)}
              aria-label="add a favorite album"
            >
              +
            </button>
          </li>
        ))}
      </ul>

      <Sheet open={picking} onClose={() => setPicking(false)} label="choose favorite albums">
        <h2 className={styles.sheetTitle}>favorite albums</h2>
        <p className={styles.sheetHint}>
          pick up to {MAX_FAVORITES} from the albums you rated ({ids.length} of {MAX_FAVORITES})
        </p>

        {ratings.length === 0 ? (
          <p className={styles.sheetHint}>rate an album first, then come back to pick favorites</p>
        ) : (
          <ul className={styles.pickList}>
            {ratings.map((r) => {
              const chosen = ids.includes(r.spotifyAlbumId);
              const full = !chosen && ids.length >= MAX_FAVORITES;
              return (
                <li key={r.spotifyAlbumId}>
                  <button
                    type="button"
                    className={`${styles.pick} ${chosen ? styles.picked : ""}`}
                    onClick={() => toggle(r.spotifyAlbumId)}
                    disabled={full}
                    aria-pressed={chosen}
                  >
                    <span className={styles.thumb} style={{ background: placeholderGradient(r.spotifyAlbumId) }}>
                      {r.coverUrl && (
                        <Image src={r.coverUrl} alt="" fill sizes="48px" className={styles.cover} />
                      )}
                    </span>
                    <span className={styles.pickText}>
                      <span className={styles.pickTitle}>{r.albumName}</span>
                      <span className={styles.pickArtist}>{r.artistName}</span>
                    </span>
                    <span className={styles.check} aria-hidden="true">{chosen ? "✓" : ""}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <button type="button" className={styles.done} onClick={() => setPicking(false)}>
          done
        </button>
      </Sheet>
    </section>
  );
}
