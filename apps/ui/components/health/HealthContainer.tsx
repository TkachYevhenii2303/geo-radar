"use client";

import { useState, useEffect, useCallback } from "react";
import healthService from "@/api/health.service";

interface HealthContainerProps {}

export function HealthContainer({}: HealthContainerProps) {
  const { getLiveness, getReadiness } = healthService;

  const [liveness, setLiveness] = useState<{
    status: string;
    message: string;
  } | null>(null);
  const [readiness, setReadiness] = useState<{
    status: string;
    message: string;
  } | null>(null);
  const [health, setHealth] = useState<
    {
      type: string;
      status: string;
      message: string;
    }[]
  >([]);

  const [autoRefresh, setAutoRefresh] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHealth = useCallback(async () => {
    try {
      setIsLoading(true);
      const livenessResponse = await getLiveness();
      const readinessResponse = await getReadiness();
      setLiveness({
        status: livenessResponse.status,
        message: livenessResponse.message,
      });
      setReadiness({
        status: readinessResponse.status,
        message: readinessResponse.message,
      });
      setHealth((prev) => [...prev, livenessResponse, readinessResponse]);
    } catch (error) {
      console.error(`Error fetching health: ${error}`);
      setHealth([]);
    } finally {
      setIsLoading(false);
    }
  }, [getLiveness, getReadiness]);

  useEffect(() => {
    fetchHealth();

    if (autoRefresh) {
      const interval = setInterval(fetchHealth, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return (
    <div>
      <h1>System Health</h1>
      <div>
        <label>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={() => setAutoRefresh(!autoRefresh)}
          />
          Refresh automatically
        </label>
        <button
          style={{
            backgroundColor: "#00f5ff",
            color: "#000",
            padding: "4px 16px",
            cursor: "pointer",
          }}
          onClick={fetchHealth}
        >
          Refresh
        </button>
      </div>

      <div>
        {Object.entries(health).map(([key, value]) => (
          <div key={key}>
            <span>
              {value.type} {value.status} {value.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
