"use client";

import { useEffect, useRef, useState } from "react";
import Button from "./Button";
import styles from "./Intro.module.css";

// spin speed in degrees per millisecond (~5s per turn)
const SPEED = 0.072;
// how long the disc takes to glide to a stop after a tap
const SETTLE_MS = 2500;

export default function Intro() {
  const spinnerRef = useRef<HTMLDivElement>(null);
  const tappedRef = useRef(false);
  const [phase, setPhase] = useState<"spinning" | "stopping" | "stopped">("spinning");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let angle = 0;
    let last = performance.now();
    let settle: { from: number; distance: number; start: number } | null = null;
    let frame: number;

    const tick = (now: number) => {
      if (tappedRef.current && !settle) {
        // land on a full turn so the title ends up upright; go at least half a turn
        let distance = 360 - angle;
        if (distance < 180) distance += 360;
        settle = { from: angle, distance, start: now };
      }

      if (settle) {
        // carry on at the current speed, then ease smoothly down to zero
        const s = Math.min((now - settle.start) / SETTLE_MS, 1);
        const glide = SPEED * SETTLE_MS * (s - 2 * s ** 2 + s ** 3);
        const land = settle.distance * (3 * s ** 2 - 2 * s ** 3);
        angle = settle.from + glide + land;
      } else {
        angle = (angle + SPEED * (now - last)) % 360;
      }
      last = now;

      if (spinnerRef.current) spinnerRef.current.style.transform = `rotate(${angle}deg)`;

      if (settle && now - settle.start >= SETTLE_MS) {
        setPhase("stopped");
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleClick = () => {
    if (phase !== "spinning") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("stopped");
      return;
    }
    tappedRef.current = true;
    setPhase("stopping");
  };

  return (
    <>
      <div className={styles.record}>
        <button
          className={styles.cd}
          onClick={handleClick}
          disabled={phase !== "spinning"}
          aria-label="stop the disc to get started"
        >
          <div ref={spinnerRef} className={styles.spinner}>
            <div className={styles.disc} />
            <svg className={styles.ring} viewBox="0 0 100 100" aria-hidden="true">
              {/* a circle that starts at the bottom, so halfway along it is the top */}
              <path id="title-ring" d="M 50,90 A 40,40 0 1 1 50,10 A 40,40 0 1 1 50,90" fill="none" />
              <text className={styles.ringText}>
                <textPath href="#title-ring" startOffset="50%" textAnchor="middle">
                  for the record
                </textPath>
              </text>
            </svg>
          </div>
          <div className={styles.sheen} />
        </button>

        <p className={styles.subtitle}>rate what you’re listening to.</p>
        <p className={`${styles.hint} ${phase !== "spinning" ? styles.hidden : ""}`}>
          tap the disc
        </p>
      </div>

      <div className={`${styles.actions} ${phase === "stopped" ? styles.shown : ""}`}>
        <Button href="/signup" transitionTypes={["nav-forward"]}>sign up</Button>
        <Button variant="secondary" href="/login" transitionTypes={["nav-forward"]}>log in</Button>
      </div>
    </>
  );
}
