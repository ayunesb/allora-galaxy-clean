
import React from 'react';
import { Loader2 } from 'lucide-react';

const ChartLoadingState: React.FC = () => {
  return (
    <div data-testid="chart-loading-container" className="flex justify-center items-center h-64">
      <Loader2 data-testid="chart-loading-spinner" className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default ChartLoadingState;
