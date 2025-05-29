import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

interface ChartLoadingStateProps {
  height?: number;
}

/**
 * ChartLoadingState - Loading skeleton component for charts
 *
 * @component
 * @param {Object} props - Component props
 * @param {number} [props.height=300] - Height of the loading state in pixels
 */
const ChartLoadingState: React.FC<ChartLoadingStateProps> = ({
  height = 300,
}) => {
  return (
    <div
      className="flex flex-col items-center justify-center bg-card rounded-md border"
      style={{ height }}
      data-testid="chart-loading"
    >
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
      <div className="text-sm text-muted-foreground">Loading chart data...</div>
      <div className="mt-6 w-full px-8">
        <Skeleton className="h-4 w-3/4 mx-auto mb-2" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
        <div className="mt-4 grid grid-cols-4 gap-4">
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
        </div>
      </div>
    </div>
  );
};

export default ChartLoadingState;
