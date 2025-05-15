
import React, { useMemo } from 'react';
import type { SystemLog } from '@/types/logs';
import { prepareErrorTrendsData } from './utils/chartDataUtils';
import ChartLoadingState from './charts/ChartLoadingState';
import { ErrorRateChart } from './charts/ErrorRateChart';
import { ErrorSeverityChart } from './charts/ErrorSeverityChart';
import { FullErrorChart } from './charts/FullErrorChart';

interface ErrorTrendsChartProps {
  logs: SystemLog[];
  dateRange: { from: Date; to: Date | undefined };
  isLoading: boolean;
  type?: 'rate' | 'severity' | 'full';
}

/**
 * ErrorTrendsChart - A component that wraps different chart types for error trends
 * 
 * @component
 * @param {Object} props - Component props
 * @param {SystemLog[]} props.logs - System logs to analyze
 * @param {Object} props.dateRange - Date range to filter logs
 * @param {boolean} props.isLoading - Loading state indicator
 * @param {string} [props.type='full'] - Type of chart to display
 */
const ErrorTrendsChart: React.FC<ErrorTrendsChartProps> = ({
  logs,
  dateRange,
  isLoading,
  type = 'full'
}) => {
  // Process chart data
  const chartData = useMemo(() => prepareErrorTrendsData(logs, dateRange), [logs, dateRange]);
  
  // Display loading state
  if (isLoading) {
    return <ChartLoadingState />;
  }
  
  // Return appropriate chart type
  switch (type) {
    case 'rate':
      return <ErrorRateChart data={chartData} isLoading={false} />;
    case 'severity':
      return <ErrorSeverityChart data={chartData} isLoading={false} />;
    case 'full':
    default:
      return <FullErrorChart data={chartData} isLoading={false} />;
  }
};

export default ErrorTrendsChart;
