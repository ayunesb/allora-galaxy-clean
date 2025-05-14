
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Additional class name for styling */
  className?: string;
  /** Custom color for the spinner */
  color?: string;
}

/**
 * Animated loading spinner component
 */
export function LoadingSpinner({
  size = "md",
  className,
  color,
}: LoadingSpinnerProps) {
  const sizeMap = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  return (
    <Loader2 
      className={cn(
        "animate-spin",
        sizeMap[size],
        color ? `text-${color}` : "text-primary",
        className
      )}
      aria-label="Loading"
    />
  );
}
