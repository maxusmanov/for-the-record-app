"use client";

import { useState } from "react";
import Image from "next/image";
import type { Artist } from "@/lib/types";
import { placeholderGradient } from "./placeholderGradient";
import styles from "./ArtistCard.module.css";

export default function ArtistCard({ artist }: { artist: Artist }) {
  // only remembered on this screen until the backend can save follows
  const [following, setFollowing] = useState(false);

  return (
    <article className={styles.card}>
      <div className={styles.photo} style={{ background: placeholderGradient(artist.id) }}>
        {artist.imageUrl ? (
          <Image src={artist.imageUrl} alt="" fill sizes="88px" className={styles.image} />
        ) : (
          <span className={styles.initial} aria-hidden="true">{artist.name[0]}</span>
        )}
      </div>
      <h3 className={styles.name}>{artist.name}</h3>
      {artist.genres && artist.genres.length > 0 && (
        <p className={styles.genres}>{artist.genres.join(", ")}</p>
      )}
      <button
        type="button"
        className={`${styles.follow} ${following ? styles.following : ""}`}
        onClick={() => setFollowing(!following)}
        aria-pressed={following}
      >
        {following ? "following" : "+ follow"}
      </button>
    </article>
  );
}
