import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./Button.module.css";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
  href?: string;
  transitionTypes?: string[];
  disabled?: boolean;
};

export default function Button({ children, variant = "primary", href, transitionTypes, disabled }: ButtonProps) {
  const className = `${styles.button} ${styles[variant]}`;

  if (href) {
    return (
      <Link href={href} transitionTypes={transitionTypes} className={className}>
        {children}
      </Link>
    );
  }

  return <button className={className} disabled={disabled}>{children}</button>;
}
