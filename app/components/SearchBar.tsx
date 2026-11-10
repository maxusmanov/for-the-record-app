import { useRef } from "react";
import styles from "./SearchBar.module.css";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function SearchBar({ value, onChange, placeholder = "search" }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function clear() {
    onChange("");
    // keep the keyboard open so the user can type a new search
    inputRef.current?.focus();
  }

  return (
    <div className={styles.searchBar}>
      <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
      <input
        ref={inputRef}
        className={styles.input}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        enterKeyHint="search"
        autoComplete="off"
      />
      {value && (
        <button type="button" className={styles.clear} onClick={clear} aria-label="clear search">
          ×
        </button>
      )}
    </div>
  );
}
