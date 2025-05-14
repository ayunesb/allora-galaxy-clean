
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  iconClassName?: string;
}

export function LoadingState({
  message = "Loading...",
  size = "md",
  className,
  iconClassName,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], iconClassName)} />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

export default LoadingState;
