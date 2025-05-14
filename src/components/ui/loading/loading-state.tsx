
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./loading-spinner";

export interface LoadingStateProps {
  /** Message to display when loading */
  message?: string;
  /** Size of the loading indicator */
  size?: "sm" | "md" | "lg" | "xl";
  /** Additional class name for styling */
  className?: string;
  /** Whether to center the loading state */
  centered?: boolean;
  /** Whether to fill the parent container */
  fullSize?: boolean;
}

/**
 * Loading state component with spinner and message
 */
export function LoadingState({
  message = "Loading...",
  size = "md",
  className,
  centered = true,
  fullSize = false,
}: LoadingStateProps) {
  return (
    <div 
      className={cn(
        "flex flex-col gap-3",
        centered && "items-center justify-center",
        fullSize && "h-full w-full min-h-[100px]",
        className
      )}
      aria-live="polite"
      aria-busy="true"
    >
      <LoadingSpinner size={size} />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
