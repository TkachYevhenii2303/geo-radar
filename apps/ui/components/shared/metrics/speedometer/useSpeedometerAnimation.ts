import { useState, useEffect, useRef, useCallback } from "react";
import { easeOutCubic } from "./speedometer.utils";

interface AnimationConfig {
  valueDuration?: number;
  needleDuration?: number;
  needleDelay?: number;
}

interface AnimationState {
  displayValue: number;
  needleValue: number;
  isNeedleVisible: boolean;
  isMounted: boolean;
}

const DEFAULT_VALUE_DURATION = 800;
const DEFAULT_NEEDLE_DURATION = 600;

export function useSpeedometerAnimation(
  targetValue: number | null,
  config: AnimationConfig = {}
): AnimationState {
  const {
    valueDuration = DEFAULT_VALUE_DURATION,
    needleDuration = DEFAULT_NEEDLE_DURATION,
    needleDelay = 0,
  } = config;

  const [displayValue, setDisplayValue] = useState(0);
  const [needleValue, setNeedleValue] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isNeedleVisible, setIsNeedleVisible] = useState(false);

  const valueAnimationRef = useRef<number | null>(null);
  const needleAnimationRef = useRef<number | null>(null);
  const needleDelayRef = useRef<NodeJS.Timeout | null>(null);
  const previousValueRef = useRef(0);

  const cancelAllAnimations = useCallback(() => {
    if (valueAnimationRef.current) {
      cancelAnimationFrame(valueAnimationRef.current);
      valueAnimationRef.current = null;
    }
    if (needleAnimationRef.current) {
      cancelAnimationFrame(needleAnimationRef.current);
      needleAnimationRef.current = null;
    }
    if (needleDelayRef.current) {
      clearTimeout(needleDelayRef.current);
      needleDelayRef.current = null;
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    return cancelAllAnimations;
  }, [cancelAllAnimations]);

  useEffect(() => {
    if (targetValue === null) {
      setDisplayValue(0);
      setNeedleValue(0);
      setIsNeedleVisible(false);
      return;
    }

    const clampedTarget = Math.max(0, Math.min(100, targetValue));
    const startValue = previousValueRef.current;
    const startTime = performance.now();

    const animateValue = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / valueDuration, 1);
      const easedProgress = easeOutCubic(progress);
      const currentValue = startValue + (clampedTarget - startValue) * easedProgress;

      setDisplayValue(currentValue);

      if (progress < 1) {
        valueAnimationRef.current = requestAnimationFrame(animateValue);
      } else {
        previousValueRef.current = clampedTarget;
      }
    };

    valueAnimationRef.current = requestAnimationFrame(animateValue);

    const isInitialAnimation = previousValueRef.current === 0 && !isNeedleVisible;
    const effectiveDelay = isInitialAnimation ? needleDelay : 0;

    needleDelayRef.current = setTimeout(() => {
      setIsNeedleVisible(true);
      const needleStartValue = isInitialAnimation ? 0 : needleValue;
      const needleStartTime = performance.now();

      const animateNeedle = (currentTime: number) => {
        const elapsed = currentTime - needleStartTime;
        const progress = Math.min(elapsed / needleDuration, 1);
        const easedProgress = easeOutCubic(progress);
        const currentNeedleValue =
          needleStartValue + (clampedTarget - needleStartValue) * easedProgress;

        setNeedleValue(currentNeedleValue);

        if (progress < 1) {
          needleAnimationRef.current = requestAnimationFrame(animateNeedle);
        }
      };

      needleAnimationRef.current = requestAnimationFrame(animateNeedle);
    }, effectiveDelay);

    return cancelAllAnimations;
  }, [targetValue, valueDuration, needleDuration, needleDelay, cancelAllAnimations]);

  return {
    displayValue,
    needleValue,
    isNeedleVisible,
    isMounted,
  };
}
