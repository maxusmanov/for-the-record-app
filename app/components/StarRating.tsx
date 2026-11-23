"use client";

import { useState } from "react";
import { MAX_STARS } from "@/lib/ratings";
import styles from "./StarRating.module.css";

type StarRatingProps = {
  // 0 means not rated yet
  value?: number;
  // leave this out to show the stars without letting anyone change them
  onChange?: (stars: number) => void;
  max?: number;
  size?: "sm" | "md";
  label?: string;
};

export default function StarRating({
  value = 0,
  onChange,
  max = MAX_STARS,
  size = "sm",
  label = "rating",
}: StarRatingProps) {
  // the star under the finger or mouse, so people see what they'd pick
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  if (!onChange) {
    return (
      <span className={`${styles.stars} ${styles[size]}`} role="img" aria-label={`${value} out of ${max} stars`}>
        {stars.map((n) => (
          <span key={n} className={n <= value ? styles.filled : styles.empty} aria-hidden="true">
            ★
          </span>
        ))}
      </span>
    );
  }

  return (
    <span
      className={`${styles.stars} ${styles[size]}`}
      role="radiogroup"
      aria-label={label}
      onMouseLeave={() => setHover(0)}
    >
      {stars.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={n === value}
          aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
          className={`${styles.star} ${n <= shown ? styles.filled : styles.empty}`}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
        >
          ★
        </button>
      ))}
    </span>
  );
}
