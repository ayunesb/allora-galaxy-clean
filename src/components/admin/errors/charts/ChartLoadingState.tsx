
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartLoadingStateProps {
  height?: number;
  className?: string;
}

/**
 * Loading state component for charts
 * 
 * @component
 * @param {Object} props - Component props
 * @param {number} [props.height=200] - Height of the loading placeholder
 * @param {string} [props.className] - Additional CSS classes
 */
const ChartLoadingState: React.FC<ChartLoadingStateProps> = ({ 
  height = 200, 
  className = '' 
}) => {
  return (
    <div 
      className={`w-full flex flex-col items-center justify-center ${className}`}
      style={{ height }}
      data-testid="chart-loading-state"
    >
      <Skeleton className="w-full h-full opacity-50" />
      <div className="absolute">
        <Skeleton className="h-6 w-32 mb-2" />
        <div className="flex gap-2 justify-center">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChartLoadingState);
