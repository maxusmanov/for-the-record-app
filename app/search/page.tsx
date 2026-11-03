import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import styles from "../login/page.module.css";
import SearchBox from "./SearchBox";

export default function SearchPage() {
  return (
    <main className={styles.main}>
      <Link href="/home" transitionTypes={["nav-back"]} className={styles.back} aria-label="back">←</Link>
      <h1 className={styles.title}>search</h1>
      <Suspense fallback={null}>
        <Gate />
      </Suspense>
    </main>
  );
}

// Same check as the home page: send logged out users to the login page.
async function Gate() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");
  return <SearchBox />;
}