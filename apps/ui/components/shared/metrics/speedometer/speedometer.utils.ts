import type { ScoreLevel, ScoreSegment, Point } from "./speedometer.types";

// Arc segment colors
export const SEGMENT_COLORS: Record<ScoreLevel, string> = {
  poor: "#EF4444",
  average: "#EAB308",
  good: "#22C55E",
} as const;

export const SEGMENT_GRADIENT_COLORS: Record<ScoreLevel, string> = {
  poor: "rgba(239, 68, 68, 0.4)",
  average: "rgba(234, 179, 8, 0.4)",
  good: "rgba(34, 197, 94, 0.4)",
} as const;

// Arc geometry constants
const SEGMENT_GAP_DEGREES = 2;
const TOTAL_ARC_DEGREES = 180;
const SEGMENT_COUNT = 3;
const SEGMENT_ARC_DEGREES =
  (TOTAL_ARC_DEGREES - SEGMENT_GAP_DEGREES * (SEGMENT_COUNT - 1)) /
  SEGMENT_COUNT;

export const SCORE_SEGMENTS: ScoreSegment[] = [
  {
    id: "poor",
    color: SEGMENT_COLORS.poor,
    gradientColor: SEGMENT_GRADIENT_COLORS.poor,
    startAngle: 180,
    endAngle: 180 - SEGMENT_ARC_DEGREES,
    range: [0, 33],
  },
  {
    id: "average",
    color: SEGMENT_COLORS.average,
    gradientColor: SEGMENT_GRADIENT_COLORS.average,
    startAngle: 180 - SEGMENT_ARC_DEGREES - SEGMENT_GAP_DEGREES,
    endAngle: 180 - SEGMENT_ARC_DEGREES * 2 - SEGMENT_GAP_DEGREES,
    range: [34, 66],
  },
  {
    id: "good",
    color: SEGMENT_COLORS.good,
    gradientColor: SEGMENT_GRADIENT_COLORS.good,
    startAngle: 180 - SEGMENT_ARC_DEGREES * 2 - SEGMENT_GAP_DEGREES * 2,
    endAngle: 0,
    range: [67, 100],
  },
];

/**
 * Converts polar coordinates to cartesian (SVG coordinate system).
 * Angle 0° is at 3 o'clock, increases counter-clockwise.
 */
export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleDegrees: number
): Point {
  const angleRadians = (angleDegrees * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleRadians),
    y: centerY - radius * Math.sin(angleRadians),
  };
}

/**
 * Generates SVG path data for an arc segment.
 */
export function createArcPath(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(centerX, centerY, radius, startAngle);
  const end = polarToCartesian(centerX, centerY, radius, endAngle);
  const largeArcFlag = startAngle - endAngle <= 180 ? 0 : 1;

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

/**
 * Finds the segment that contains the given score value.
 */
export function getSegmentByScore(score: number): ScoreSegment {
  const clampedScore = clampValue(score);

  const segment = SCORE_SEGMENTS.find(
    (seg) => clampedScore >= seg.range[0] && clampedScore <= seg.range[1]
  );

  return segment ?? SCORE_SEGMENTS[0];
}

/**
 * Converts a score (0-100) to an angle on the speedometer arc.
 * Returns angle in degrees where 180° is 0 score and 0° is 100 score.
 */
export function scoreToAngle(score: number): number {
  const clampedScore = clampValue(score);
  return TOTAL_ARC_DEGREES - (clampedScore / 100) * TOTAL_ARC_DEGREES;
}

/**
 * Calculates the arc length for a given angle range.
 */
export function calculateArcLength(
  radius: number,
  startAngle: number,
  endAngle: number
): number {
  const angleDifference = Math.abs(startAngle - endAngle);
  return (angleDifference / 360) * 2 * Math.PI * radius;
}

/**
 * Clamps a value between 0 and 100.
 */
export function clampValue(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Cubic ease-out function for smooth animations.
 */
export function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}
