"use client";

import { useEffect, useRef } from "react";

interface ScoreRingProps {
  score: number;
  animated?: boolean;
  size?: number;
}

function getScoreColor(score: number): string {
  if (score >= 70) return "#22c55e"; // hot
  if (score >= 40) return "#f59e0b"; // warm
  return "#ef4444";                  // cold
}

export function ScoreRing({ score, animated = true, size = 96 }: ScoreRingProps) {
  const strokeWidth = 7;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = getScoreColor(score);

  const progressRef = useRef<SVGCircleElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!animated) {
      // Set final state immediately
      if (progressRef.current) {
        progressRef.current.style.strokeDashoffset = String(
          circumference - (score / 100) * circumference
        );
      }
      if (numberRef.current) {
        numberRef.current.textContent = String(score);
      }
      return;
    }

    const duration = 800; // ms
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentScore = Math.round(eased * score);
      const offset = circumference - (eased * score / 100) * circumference;

      if (progressRef.current) {
        progressRef.current.style.strokeDashoffset = String(offset);
      }
      if (numberRef.current) {
        numberRef.current.textContent = String(currentScore);
      }

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, [score, animated, circumference]);

  return (
    <div
      className="relative flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#252a35"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          ref={progressRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference} // starts at 0, animated in useEffect
          style={{
            transition: animated ? "none" : undefined,
            filter: `drop-shadow(0 0 6px ${color}55)`,
          }}
        />
      </svg>

      {/* Score number in center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          ref={numberRef}
          className="font-mono font-bold leading-none"
          style={{
            fontSize: size >= 96 ? "22px" : "16px",
            color,
          }}
        >
          0
        </span>
        <span
          className="font-mono text-[9px] leading-none mt-0.5"
          style={{ color: "#475569" }}
        >
          /100
        </span>
      </div>
    </div>
  );
}
