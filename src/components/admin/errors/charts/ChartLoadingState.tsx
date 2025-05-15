
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartLoadingStateProps {
  height?: number;
}

const ChartLoadingState: React.FC<ChartLoadingStateProps> = ({ height = 300 }) => {
  return (
    <div className="rounded-md border p-4 w-full">
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-3 w-[120px]" />
      </div>
      <Skeleton 
        className="w-full rounded-md"
        style={{ height: `${height}px` }}
        data-testid="chart-skeleton"
      />
      <div className="flex flex-row justify-between mt-2 gap-2">
        <Skeleton className="h-4 w-[60px]" />
        <Skeleton className="h-4 w-[60px]" />
        <Skeleton className="h-4 w-[60px]" />
      </div>
    </div>
  );
};

export default ChartLoadingState;
