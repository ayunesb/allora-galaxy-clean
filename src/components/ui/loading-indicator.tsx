
import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  centered?: boolean;
  fullPage?: boolean;
  spinnerClassName?: string;
}

export function LoadingIndicator({
  size = 'md',
  text,
  className,
  centered = false,
  fullPage = false,
  spinnerClassName
}: LoadingIndicatorProps) {
  // Size mappings
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };
  
  const iconSize = sizeMap[size];
  const containerClasses = cn(
    "flex items-center gap-3",
    centered && "justify-center",
    fullPage && "h-screen items-center justify-center",
    className
  );
  
  return (
    <div className={containerClasses}>
      <Loader2 
        className={cn("animate-spin text-primary", iconSize, spinnerClassName)} 
      />
      {text && <span className="text-muted-foreground">{text}</span>}
    </div>
  );
}

export default LoadingIndicator;
