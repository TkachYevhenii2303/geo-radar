import type React from "react";

export type ScoreLevel = "poor" | "average" | "good";

export interface ScoreSegment {
  id: ScoreLevel;
  color: string;
  gradientColor: string;
  startAngle: number;
  endAngle: number;
  range: [number, number];
}

export interface SpeedometerProps {
  value: number | null;
  maxValue?: number;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface Point {
  x: number;
  y: number;
}

export interface LineCoordinates {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface ArcPath extends ScoreSegment {
  path: string;
  length: number;
}
