"use client";

import { useActionState } from "react";
import Button from "../components/Button";
import styles from "./page.module.css";
import PageTransition from "../components/PageTransition";
import Link from "next/link";
import { login } from "../auth/actions";

export default function Login() {
  const [state, formAction, pending] = useActionState(login, {});

  return (
    <PageTransition>
      <form action={formAction} className={styles.main}>
        <Link href="/" transitionTypes={["nav-back"]} className={styles.back} aria-label="back">←</Link>
        <h1 className={styles.title}>log in</h1>

        <div className={styles.form}>
          <input className={styles.input} name="email" type="email" placeholder="email" autoComplete="email" required />
          <input className={styles.input} name="password" type="password" placeholder="password" autoComplete="current-password" required />
          <a className={styles.forgot} href="#">forgot password?</a>
          {state.error && <p className={styles.error} role="alert">{state.error}</p>}
        </div>

        <div className={styles.actions}>
          <Button disabled={pending}>{pending ? "logging in…" : "log in"}</Button>
        </div>
      </form>
    </PageTransition>
  );
}
