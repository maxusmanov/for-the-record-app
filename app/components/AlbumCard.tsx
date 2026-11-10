import Image from "next/image";
import type { Album } from "@/lib/types";
import { placeholderGradient } from "./placeholderGradient";
import StarRating from "./StarRating";
import styles from "./AlbumCard.module.css";

type AlbumCardProps = {
  album: Album;
  // pass onRate to let the user rate the album right on the card
  userRating?: number;
  onRate?: (stars: number) => void;
};

export default function AlbumCard({ album, userRating, onRate }: AlbumCardProps) {
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
      {onRate && (
        <div className={styles.stars}>
          <StarRating value={userRating} onChange={onRate} label={`rate ${album.title}`} />
        </div>
      )}
    </article>
  );
}
