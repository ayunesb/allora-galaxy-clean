import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressCircleProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  strokeWidth?: number;
  showLabel?: boolean;
  labelClassName?: string;
}

export function ProgressCircle({
  value,
  max = 100,
  size = "md",
  className,
  strokeWidth,
  showLabel = false,
  labelClassName,
}: ProgressCircleProps) {
  // Calculate progress as a percentage
  const progress = Math.min(Math.max(0, value), max) / max;

  // Size mappings
  const sizeMap = {
    sm: { width: 16, height: 16, defaultStrokeWidth: 2 },
    md: { width: 24, height: 24, defaultStrokeWidth: 3 },
    lg: { width: 48, height: 48, defaultStrokeWidth: 4 },
  };

  const { width, height, defaultStrokeWidth } = sizeMap[size];
  const stroke = strokeWidth || defaultStrokeWidth;

  // Calculate dimensions for the circle
  const radius = (Math.min(width, height) - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.2}
          strokeWidth={stroke}
        />

        {/* Progress circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showLabel && (
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center text-xs font-medium",
            labelClassName,
          )}
        >
          {Math.round(progress * 100)}%
        </span>
      )}
    </div>
  );
}

export default ProgressCircle;
