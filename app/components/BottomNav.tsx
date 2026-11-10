import Link from "next/link";
import type { CSSProperties } from "react";
import styles from "./BottomNav.module.css";

// icons come from the Figma design, in public/icons
const items = [
  { label: "home", href: "/home", icon: "house", size: 21 },
  { label: "search", href: "/discover", icon: "search", size: 21 },
  { label: "rate", href: "/rate", icon: "circle-plus", size: 26 },
  { label: "diary", href: "/diary", icon: "book-open", size: 21 },
  { label: "you", href: "/profile", icon: "user-round", size: 21 },
];

export default function BottomNav({ active }: { active: string }) {
  return (
    <nav className={styles.nav} aria-label="main">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={`${styles.item} ${item.label === active ? styles.active : ""}`}
          aria-current={item.label === active ? "page" : undefined}
        >
          {/* the svg is used as a mask, so it takes the text color */}
          <span
            className={styles.icon}
            style={{ "--icon": `url(/icons/${item.icon}.svg)`, width: item.size, height: item.size } as CSSProperties}
            aria-hidden="true"
          />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
