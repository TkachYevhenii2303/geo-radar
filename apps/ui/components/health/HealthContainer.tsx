"use client";

import { useState, useEffect, useCallback } from "react";
import healthService from "@/api/health.service";
import { HealthCard } from "./HealthCard";
import styles from "./health-container.module.scss";

interface HealthStatus {
  type: "liveness" | "readiness" | "http";
  status: string;
  message: string;
  checkedAt: Date;
}

export function HealthContainer() {
  const [liveness, setLiveness] = useState<HealthStatus | null>(null);
  const [readiness, setReadiness] = useState<HealthStatus | null>(null);
  const [http, setHttp] = useState<HealthStatus | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchHealth = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [livenessResponse, readinessResponse, httpResponse] =
        await Promise.all([
          healthService.getLiveness(),
          healthService.getReadiness(),
          healthService.getHttp(),
        ]);

      const now = new Date();
      setLiveness({
        type: "liveness",
        status: livenessResponse.status,
        message: livenessResponse.message,
        checkedAt: now,
      });
      setReadiness({
        type: "readiness",
        status: readinessResponse.status,
        message: readinessResponse.message,
        checkedAt: now,
      });
      setHttp({
        type: "http",
        status: httpResponse?.status,
        message: httpResponse.message,
        checkedAt: now,
      });
      setLastChecked(now);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch health status"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchHealth]);

  const healthCards = [
    {
      label: "Liveness",
      description: "Is the application process alive and not hanging?",
      status: liveness?.status,
      message: liveness?.message,
      isLoading: isLoading && !liveness,
    },
    {
      label: "Readiness",
      description:
        "Is the application ready to serve requests? (DB connection)",
      status: readiness?.status,
      message: readiness?.message,
      isLoading: isLoading && !readiness,
    },
    {
      label: "HTTP",
      description: "Is the application able to make HTTP requests?",
      status: http?.status,
      message: http?.message,
      isLoading: isLoading && !http,
    },
    {
      label: "HTTP",
      description: "Is the application able to make HTTP requests?",
      status: http?.status,
      message: http?.message,
      isLoading: isLoading && !http,
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>System Health</h1>
        {/* {lastChecked && (
          <span className={styles.lastChecked}>
            Last checked: {lastChecked.toLocaleTimeString()}
          </span>
        )} */}
      </div>
      {/* <div className={styles.controls}>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={() => setAutoRefresh((prev) => !prev)}
          />
          <span>Auto-refresh (5s)</span>
        </label>
        <button
          className={styles.refreshBtn}
          onClick={fetchHealth}
          disabled={isLoading}
        >
          {isLoading ? "Checking..." : "Refresh"}
        </button>
      </div> */}
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.cards}>
        {healthCards.map((card) => (
          <HealthCard
            key={card.label}
            label={card.label}
            description={card.description}
            status={card.status}
            message={card.message}
            isLoading={card.isLoading}
          />
        ))}
      </div>
    </div>
  );
}
