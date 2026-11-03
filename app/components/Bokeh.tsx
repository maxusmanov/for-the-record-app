import styles from "./Bokeh.module.css";

export default function Bokeh() {
  return (
    <div className={styles.bokeh} aria-hidden="true">
      <div className={`${styles.light} ${styles.pink}`} />
      <div className={`${styles.light} ${styles.blue}`} />
      <div className={`${styles.light} ${styles.amber}`} />
      <div className={`${styles.light} ${styles.purple}`} />
      <div className={styles.veil} />
    </div>
  );
}