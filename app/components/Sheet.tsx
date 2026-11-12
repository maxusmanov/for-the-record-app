"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./Sheet.module.css";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  // read out by screen readers
  label: string;
  children: ReactNode;
};

// A panel that slides up from the bottom of the screen, over a dimmed page.
// It is a native <dialog>, so Escape closes it and the keyboard stays inside.
export default function Sheet({ open, onClose, label, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.sheet}
      aria-label={label}
      onClose={onClose}
      // a press on the dimmed area behind the panel closes it
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.content}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="close">
          ×
        </button>
        {open && children}
      </div>
    </dialog>
  );
}
