export { Speedometer } from "./Speedometer";
export { useSpeedometerAnimation } from "./useSpeedometerAnimation";

export type {
  SpeedometerProps,
  ScoreLevel,
  ScoreSegment,
  Point,
  LineCoordinates,
  ArcPath,
} from "./speedometer.types";

export {
  SEGMENT_COLORS,
  SEGMENT_GRADIENT_COLORS,
  SCORE_SEGMENTS,
  polarToCartesian,
  createArcPath,
  getSegmentByScore,
  scoreToAngle,
  calculateArcLength,
  clampValue,
  easeOutCubic,
} from "./speedometer.utils";

export * from "./speedometer.constants";
