import { HealthContainer } from "@/components/health/HealthContainer";
import styles from "./health-page.module.scss";

export default function HealthPage() {
  return (
    <div className={styles.page}>
      <HealthContainer />
    </div>
  );
}
