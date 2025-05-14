
import { cn } from "@/lib/utils";

export interface SkeletonProps {
  /** Width of the skeleton */
  width?: string | number;
  /** Height of the skeleton */
  height?: string | number;
  /** Whether the skeleton is rounded */
  rounded?: boolean | "full" | "md" | "lg" | "xl";
  /** Additional class name for styling */
  className?: string;
}

/**
 * Animated skeleton loader for content placeholders
 */
export function Skeleton({
  width,
  height,
  rounded = false,
  className,
}: SkeletonProps) {
  const roundedMap = {
    full: "rounded-full",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    true: "rounded",
    false: ""
  };

  const roundedClass = typeof rounded === "boolean" 
    ? roundedMap[rounded ? "true" : "false"]
    : roundedMap[rounded];

  const style = {
    width: width !== undefined ? (typeof width === "number" ? `${width}px` : width) : undefined,
    height: height !== undefined ? (typeof height === "number" ? `${height}px` : height) : undefined,
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-muted",
        roundedClass,
        className
      )}
      style={style}
      aria-hidden="true"
    />
  );
}
