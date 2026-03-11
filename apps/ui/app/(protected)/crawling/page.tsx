import styles from "./crawling-page.module.scss";
import { CrawlingContainer } from "@/components/crawling/CrawlingContainer";

export default function Page() {
  return (
    <div className={styles.page}>
      <CrawlingContainer />
    </div>
  );
}
