
import React, { useMemo } from 'react';
import type { SystemLog } from '@/types/logs';
import { prepareErrorTrendsData } from './utils/chartDataUtils';
import ChartLoadingState from './charts/ChartLoadingState';
import ErrorRateChart from './charts/ErrorRateChart';
import ErrorSeverityChart from './charts/ErrorSeverityChart';
import FullErrorChart from './charts/FullErrorChart';

interface ErrorTrendsChartProps {
  logs: SystemLog[];
  dateRange: { from: Date; to: Date | undefined };
  isLoading: boolean;
  type?: 'rate' | 'severity' | 'full';
}

const ErrorTrendsChart: React.FC<ErrorTrendsChartProps> = ({
  logs,
  dateRange,
  isLoading,
  type = 'full'
}) => {
  const chartData = useMemo(() => prepareErrorTrendsData(logs, dateRange), [logs, dateRange]);
  
  if (isLoading) {
    return <ChartLoadingState />;
  }
  
  if (type === 'rate') {
    return <ErrorRateChart data={chartData} isLoading={false} />;
  }
  
  if (type === 'severity') {
    return <ErrorSeverityChart data={chartData} isLoading={false} />;
  }
  
  // Default to full chart
  return <FullErrorChart data={chartData} isLoading={false} />;
};

export default ErrorTrendsChart;
