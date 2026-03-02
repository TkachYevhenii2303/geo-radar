// SVG viewport dimensions
export const VIEWBOX_SIZE = 220;
export const VIEWBOX_HEIGHT = VIEWBOX_SIZE / 2 + 10;

// Arc geometry
export const STROKE_WIDTH = 10;
export const ARC_GRADIENT_GAP = 4;
export const NEEDLE_WIDTH = 3;

// Calculated dimensions
export const CENTER_X = VIEWBOX_SIZE / 2;
export const CENTER_Y = VIEWBOX_SIZE / 2;
export const ARC_RADIUS = (VIEWBOX_SIZE - STROKE_WIDTH * 2) / 2;
export const GRADIENT_RADIUS = ARC_RADIUS - STROKE_WIDTH / 2 - ARC_GRADIENT_GAP;

// Text positioning
export const SCORE_TEXT_Y = CENTER_Y - 36;
export const LABEL_TEXT_Y = CENTER_Y;

// Animation timing
export const ARC_ANIMATION_DURATION_S = 0.4;
export const SEGMENT_COUNT = 3;
export const TOTAL_ARC_ANIMATION_MS =
  SEGMENT_COUNT * ARC_ANIMATION_DURATION_S * 1000;

// Colors
export const EMPTY_STATE_COLOR = "#E5E7EB";
export const NEEDLE_COLOR = "#4a4a4a";
