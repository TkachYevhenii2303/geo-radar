"use client";

import { useMemo } from "react";
import type {
  SpeedometerProps,
  ArcPath,
  LineCoordinates,
} from "./speedometer.types";
import {
  SCORE_SEGMENTS,
  polarToCartesian,
  createArcPath,
  getSegmentByScore,
  scoreToAngle,
  calculateArcLength,
} from "./speedometer.utils";
import {
  VIEWBOX_SIZE,
  VIEWBOX_HEIGHT,
  STROKE_WIDTH,
  NEEDLE_WIDTH,
  CENTER_X,
  CENTER_Y,
  ARC_RADIUS,
  GRADIENT_RADIUS,
  SCORE_TEXT_Y,
  LABEL_TEXT_Y,
  ARC_ANIMATION_DURATION_S,
  TOTAL_ARC_ANIMATION_MS,
  EMPTY_STATE_COLOR,
  NEEDLE_COLOR,
} from "./speedometer.constants";
import { useSpeedometerAnimation } from "./useSpeedometerAnimation";
import styles from "./Speedometer.module.scss";

function formatDisplayValue(
  value: number | null,
  animatedValue: number
): string {
  if (value === null) return "—";
  return Number.isInteger(animatedValue)
    ? String(Math.round(animatedValue))
    : animatedValue.toFixed(2);
}

function calculateNeedlePosition(value: number): LineCoordinates {
  const angle = scoreToAngle(value);
  const innerPoint = polarToCartesian(
    CENTER_X,
    CENTER_Y,
    ARC_RADIUS - STROKE_WIDTH / 2,
    angle
  );
  const outerPoint = polarToCartesian(
    CENTER_X,
    CENTER_Y,
    ARC_RADIUS + STROKE_WIDTH / 2,
    angle
  );

  return {
    x1: innerPoint.x,
    y1: innerPoint.y,
    x2: outerPoint.x,
    y2: outerPoint.y,
  };
}

function createGradientFillPath(): string {
  const startPoint = polarToCartesian(CENTER_X, CENTER_Y, GRADIENT_RADIUS, 180);
  const endPoint = polarToCartesian(CENTER_X, CENTER_Y, GRADIENT_RADIUS, 0);

  return `M ${startPoint.x} ${startPoint.y} A ${GRADIENT_RADIUS} ${GRADIENT_RADIUS} 0 0 1 ${endPoint.x} ${endPoint.y} L ${CENTER_X} ${CENTER_Y} Z`;
}

export function Speedometer({
  value,
  maxValue = 100,
  className,
  style,
}: SpeedometerProps) {
  const { displayValue, needleValue, isNeedleVisible, isMounted } =
    useSpeedometerAnimation(value, {
      needleDelay: TOTAL_ARC_ANIMATION_MS,
    });

  const formattedValue = useMemo(
    () => formatDisplayValue(value, displayValue),
    [value, displayValue]
  );

  const activeSegment = useMemo(
    () => getSegmentByScore(displayValue),
    [displayValue]
  );

  const needlePosition = useMemo(
    () => calculateNeedlePosition(needleValue),
    [needleValue]
  );

  const arcSegments: ArcPath[] = useMemo(
    () =>
      SCORE_SEGMENTS.map((segment) => ({
        ...segment,
        path: createArcPath(
          CENTER_X,
          CENTER_Y,
          ARC_RADIUS,
          segment.startAngle,
          segment.endAngle
        ),
        length: calculateArcLength(
          ARC_RADIUS,
          segment.startAngle,
          segment.endAngle
        ),
      })),
    []
  );

  const gradientFillPath = useMemo(() => createGradientFillPath(), []);

  const renderArcSegments = (overrideColor?: string) =>
    arcSegments.map((segment, index) => (
      <path
        key={segment.id}
        d={segment.path}
        fill="none"
        stroke={overrideColor ?? segment.color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="butt"
        className={!overrideColor && isMounted ? styles.arcSegment : undefined}
        style={
          !overrideColor
            ? ({
                "--arc-length": segment.length,
                "--arc-delay": `${index * ARC_ANIMATION_DURATION_S}s`,
                "--arc-duration": `${ARC_ANIMATION_DURATION_S}s`,
              } as React.CSSProperties)
            : undefined
        }
      />
    ));

  const renderGradientDefs = () => (
    <defs>
      {SCORE_SEGMENTS.map((segment) => (
        <radialGradient
          key={`gradient-${segment.id}`}
          id={`gradient-${segment.id}`}
          cx="50%"
          cy="0%"
          r="100%"
          fx="50%"
          fy="0%"
        >
          <stop offset="0%" stopColor={segment.gradientColor} />
          <stop
            offset="70%"
            stopColor={segment.gradientColor}
            stopOpacity={0.3}
          />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      ))}
    </defs>
  );

  const renderScoreText = () => (
    <>
      <text
        x={CENTER_X}
        y={SCORE_TEXT_Y}
        textAnchor="middle"
        dominantBaseline="middle"
        className={styles.scoreValue}
      >
        {formattedValue}
      </text>
      <text
        x={CENTER_X}
        y={LABEL_TEXT_Y}
        textAnchor="middle"
        dominantBaseline="middle"
        className={styles.scoreLabel}
      >
        out of {maxValue}
      </text>
    </>
  );

  if (value === null) {
    return (
      <div className={`${styles.speedometer} ${className ?? ""}`} style={style}>
        <svg
          className={styles.gauge}
          viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_HEIGHT}`}
          role="img"
          aria-label="No data available"
          preserveAspectRatio="xMidYMid meet"
        >
          {renderArcSegments(EMPTY_STATE_COLOR)}
          {renderScoreText()}
        </svg>
      </div>
    );
  }

  return (
    <div className={`${styles.speedometer} ${className ?? ""}`} style={style}>
      <svg
        className={styles.gauge}
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_HEIGHT}`}
        role="img"
        aria-label={`Score: ${value.toFixed(2)} out of ${maxValue}`}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={maxValue}
        preserveAspectRatio="xMidYMid meet"
      >
        {renderGradientDefs()}

        <path
          d={gradientFillPath}
          fill={`url(#gradient-${activeSegment.id})`}
          className={styles.gradientFill}
        />

        {renderArcSegments()}

        {isNeedleVisible && (
          <line
            x1={needlePosition.x1}
            y1={needlePosition.y1}
            x2={needlePosition.x2}
            y2={needlePosition.y2}
            stroke={NEEDLE_COLOR}
            strokeWidth={NEEDLE_WIDTH}
            strokeLinecap="butt"
            className={styles.needle}
          />
        )}

        {renderScoreText()}
      </svg>
    </div>
  );
}

export default Speedometer;
