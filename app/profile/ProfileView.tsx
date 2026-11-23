"use client";

import Link from "next/link";
import BottomNav from "../components/BottomNav";
import PageTransition from "../components/PageTransition";
import StarRating from "../components/StarRating";
import { placeholderGradient } from "../components/placeholderGradient";
import { useRatings } from "@/lib/useRatings";
import type { Rating } from "@/lib/types";
import Favorites from "./Favorites";
import styles from "./profile.module.css";

type ProfileViewProps = {
  name: string;
  username: string | null;
  avatarUrl: string | null;
};

export default function ProfileView({ name, username, avatarUrl }: ProfileViewProps) {
  const { ratings, status, rate, saveFailed } = useRatings();

  // best rated first, newest first when the stars are the same
  const sorted = [...ratings].sort(
    (a, b) => b.rating - a.rating || b.ratedAt.localeCompare(a.ratedAt),
  );

  // albums the user wrote about, best rated first
  const reviews = sorted.filter((r) => r.review);

  // Followers, following and diary entries don't exist yet, so they show 0.
  const stats = [
    { label: "albums rated", value: ratings.length },
    { label: "diary entries", value: 0 },
    { label: "followers", value: 0 },
    { label: "following", value: 0 },
  ];

  function changeRating(r: Rating, stars: number) {
    rate({
      spotifyAlbumId: r.spotifyAlbumId,
      rating: stars,
      albumName: r.albumName,
      artistName: r.artistName,
      coverUrl: r.coverUrl,
      releaseYear: r.releaseYear,
    });
  }

  return (
    <PageTransition>
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.avatar} style={{ background: placeholderGradient(username ?? name) }}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className={styles.avatarImage} />
            ) : (
              <span aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <h1 className={styles.name}>{name}</h1>
          {username && <p className={styles.username}>@{username}</p>}
          {/* the profiles table has no bio column yet */}
          <p className={styles.bio}>no bio yet</p>
        </header>

        <dl className={styles.stats}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <dt className={styles.statLabel}>{stat.label}</dt>
              <dd className={styles.statValue}>{stat.value}</dd>
            </div>
          ))}
        </dl>

        <section className={styles.section}>
          <h2 className={styles.heading}>rated albums</h2>

          {status === "loading" && <p className={styles.message}>loading…</p>}
          {status === "error" && (
            <div className={styles.empty} role="alert">
              <p className={styles.emptyTitle}>could not load your ratings</p>
              <p className={styles.emptyHint}>check your connection and try again</p>
            </div>
          )}
          {status === "ready" && sorted.length === 0 && (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>no ratings yet</p>
              <p className={styles.emptyHint}>
                <Link href="/discover" className={styles.link}>find an album</Link> and give it some stars
              </p>
            </div>
          )}
          {sorted.length > 0 && (
            <ol className={styles.list}>
              {sorted.map((r) => (
                <li key={r.spotifyAlbumId} className={styles.row}>
                  <div
                    className={styles.cover}
                    style={{ background: placeholderGradient(r.spotifyAlbumId) }}
                  >
                    {r.coverUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.coverUrl} alt="" className={styles.coverImage} />
                    )}
                  </div>
                  <div className={styles.info}>
                    <p className={styles.albumName}>{r.albumName}</p>
                    <p className={styles.albumArtist}>{r.artistName}</p>
                    <StarRating
                      value={r.rating}
                      onChange={(stars) => changeRating(r, stars)}
                      label={`your rating for ${r.albumName}`}
                    />
                  </div>
                </li>
              ))}
            </ol>
          )}
          {saveFailed && (
            <p className={styles.message} role="alert">
              could not save your change, try again
            </p>
          )}
        </section>

        <Favorites ratings={sorted} />

        <section className={styles.section}>
          <h2 className={styles.heading}>reviews</h2>
          {reviews.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyHint}>
                <Link href="/rate" className={styles.link}>write a review</Link> and it will show up here
              </p>
            </div>
          ) : (
            <ul className={styles.list}>
              {reviews.map((r) => (
                <li key={r.spotifyAlbumId} className={styles.review}>
                  <div className={styles.reviewTop}>
                    <p className={styles.albumName}>{r.albumName}</p>
                    <StarRating value={r.rating} />
                  </div>
                  <p className={styles.albumArtist}>{r.artistName}</p>
                  <p className={styles.reviewText}>{r.review}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <BottomNav active="you" />
    </PageTransition>
  );
}
