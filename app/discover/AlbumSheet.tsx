"use client";

import Image from "next/image";
import Link from "next/link";
import Sheet from "../components/Sheet";
import StarRating from "../components/StarRating";
import { placeholderGradient } from "../components/placeholderGradient";
import { rateHref } from "@/lib/ratings";
import type { Album } from "@/lib/types";
import styles from "./AlbumSheet.module.css";

type AlbumSheetProps = {
  // the album that was pressed, or null when nothing is open
  album: Album | null;
  // the user's own rating for it, 0 if they haven't rated it
  userRating: number;
  onClose: () => void;
};

// A short summary of an album. Rating and writing happen on the rate page.
export default function AlbumSheet({ album, userRating, onClose }: AlbumSheetProps) {
  return (
    <Sheet
      open={album !== null}
      onClose={onClose}
      label={album ? `${album.title} by ${album.artist}` : "album"}
    >
      {album && (
        <>
          <div className={styles.top}>
            <div className={styles.cover} style={{ background: placeholderGradient(album.id) }}>
              {album.coverUrl && (
                <Image src={album.coverUrl} alt="" fill sizes="112px" className={styles.image} />
              )}
            </div>
            <div className={styles.info}>
              <h2 className={styles.title}>{album.title}</h2>
              <p className={styles.artist}>{album.artist}</p>
              {album.year && <p className={styles.meta}>{album.year}</p>}
              {album.genres && album.genres.length > 0 && (
                <p className={styles.meta}>{album.genres.join(", ")}</p>
              )}
            </div>
          </div>

          {userRating > 0 && (
            <div className={styles.yours}>
              <span className={styles.yoursLabel}>you rated it</span>
              <StarRating value={userRating} />
            </div>
          )}

          <Link
            href={rateHref(album)}
            transitionTypes={["nav-forward"]}
            className={styles.action}
          >
            {userRating > 0 ? "edit your rating or review" : "rate or write about this"}
          </Link>
        </>
      )}
    </Sheet>
  );
}
