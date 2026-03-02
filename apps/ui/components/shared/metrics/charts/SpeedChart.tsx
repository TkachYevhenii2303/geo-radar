"use client";

import { Card, Text, Tooltip, Skeleton, ActionIcon } from "@mantine/core";
import { Info } from "lucide-react";
import { Speedometer } from "../speedometer";
import styles from "./SpeedChart.module.scss";

interface SpeedChartProps {
  value: number | null;
  title: string;
  tooltip?: string;
  isLoading?: boolean;
  className?: string;
}

export function SpeedChart({
  value,
  title,
  tooltip,
  isLoading = false,
  className,
}: SpeedChartProps) {
  if (isLoading) {
    return (
      <Card
        className={`${styles.card} ${className || ""}`}
        padding="md"
        radius="md"
        withBorder
      >
        <div className={styles.header}>
          <Skeleton height={16} width="60%" radius="sm" />
          <Skeleton height={20} width={20} circle />
        </div>
        <div className={styles.gaugeWrapper}>
          <Skeleton height={100} width="80%" radius="md" />
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`${styles.card} ${className || ""}`}
      padding="md"
      radius="md"
      withBorder
    >
      <div className={styles.header}>
        <Text size="sm" c="dimmed" fw={500} className={styles.title}>
          {title}
        </Text>
        {tooltip && (
          <Tooltip label={tooltip} position="top" withArrow multiline w={200}>
            <ActionIcon
              variant="subtle"
              size="sm"
              color="gray"
              className={styles.infoButton}
            >
              <Info size={14} />
            </ActionIcon>
          </Tooltip>
        )}
      </div>

      <div className={styles.gaugeWrapper}>
        <Speedometer value={value} />
      </div>
    </Card>
  );
}

export default SpeedChart;
