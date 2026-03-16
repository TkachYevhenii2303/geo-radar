import styles from "./health-card.module.scss";

interface HealthCardProps {
  label: string;
  description: string;
  status?: string;
  message?: string;
  isLoading?: boolean;
}

export function HealthCard({
  label,
  description,
  status,
  message,
  isLoading = false,
}: HealthCardProps) {
  const isUp = status === "up";
  const statusClass = isLoading
    ? styles.loading
    : isUp
      ? styles.up
      : styles.down;

  const badgeText = isLoading ? "Checking" : (status ?? "Unknown");

  return (
    <div className={`${styles.card} ${statusClass}`}>
      <div className={styles.topRow}>
        <div className={styles.labelGroup}>
          <span className={styles.dot} aria-hidden="true" />
          <h2 className={styles.label}>{label}</h2>
        </div>
        <span className={styles.badge}>{badgeText}</span>
      </div>

      <p className={styles.description}>{description}</p>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}
