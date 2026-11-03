import styles from "./page.module.css";
import PageTransition from "./components/PageTransition";
import Intro from "./components/Intro";

export default function Home() {
  return (
    <PageTransition>
      <main className={styles.main}>
        <h1 className={styles.srOnly}>for the record</h1>
        <Intro />
      </main>
    </PageTransition>
  );
}
