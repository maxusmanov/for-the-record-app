import Image from "next/image";
import type { Album } from "@/lib/types";
import { placeholderGradient } from "./placeholderGradient";
import styles from "./AlbumCard.module.css";

export default function AlbumCard({ album }: { album: Album }) {
  return (
    <article className={styles.card}>
      <div className={styles.cover} style={{ background: placeholderGradient(album.id) }}>
        {album.coverUrl ? (
          <Image src={album.coverUrl} alt="" fill sizes="120px" className={styles.image} />
        ) : (
          <span className={styles.coverTitle} aria-hidden="true">{album.title.toLowerCase()}</span>
        )}
      </div>
      <h3 className={styles.title}>{album.title}</h3>
      <p className={styles.artist}>{album.artist}</p>
      {album.averageRating !== undefined && (
        <p className={styles.rating} aria-label={`rated ${album.averageRating} out of 5`}>
          ★ {album.averageRating.toFixed(1)}
        </p>
      )}
    </article>
  );
}
