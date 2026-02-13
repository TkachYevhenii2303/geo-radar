import styles from "./page.module.scss";

export default function Page() {
  return (
    <div className={styles.page}>
      <div className={`${styles.block} ${styles["block--1"]}`}></div>
      <div className={`${styles.block} ${styles["block--2"]}`}></div>
      <div className={`${styles.block} ${styles["block--3"]}`}></div>
      <div className={`${styles.block} ${styles["block--4"]}`}></div>
      <div className={`${styles.block} ${styles["block--5"]}`}></div>
    </div>
  );
}
