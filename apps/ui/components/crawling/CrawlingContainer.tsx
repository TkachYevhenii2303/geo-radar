"use client";
import { useState, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import crawlerService from "@/api/crawler.service";
import styles from "./crawling-container.module.scss";
import "react-toastify/dist/ReactToastify.css";

interface CrawlingContainerProps {}

export function CrawlingContainer({}: CrawlingContainerProps) {
  const { startCrawling } = crawlerService;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(null);

  // ? How it works? useCallback!
  const handleSend = useCallback(
    async (e: any) => {
      e.preventDefault();
      setError(null);
      setIsLoading(true);

      try {
        if (!websiteUrl) {
          throw new Error("Website URL is required");
        }
        const response = await startCrawling(websiteUrl ?? "");
        console.log(`Crawling response: ${JSON.stringify(response)}`);
        // toast.success(response.message, {
        //   position: "bottom-right",
        // });
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        console.error(`Crawling error: ${error}`);
      } finally {
        setIsLoading(false);
      }
    },
    [websiteUrl]
  );

  return (
    <div className={styles.crawling_container}>
      <form
        className={styles.crawling_container__form}
        onSubmit={(e: any) => handleSend(e)}
      >
        <input
          type="text"
          placeholder="Enter website URL"
          value={websiteUrl || "https://intercode.com/"}
          onChange={(e: any) =>
            setWebsiteUrl(e.target.value || "https://intercode.com/")
          }
        />
        <button type="submit">Send</button>
      </form>
      {/* <ToastContainer /> */}
    </div>
  );
}
