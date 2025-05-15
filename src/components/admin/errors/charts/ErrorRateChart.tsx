
import React from 'react';
import { ErrorTrendDataPoint } from '@/types/logs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import ChartLoadingState from './ChartLoadingState';

interface ErrorRateChartProps {
  data: ErrorTrendDataPoint[];
  isLoading?: boolean;
  height?: number;
}

/**
 * Chart component for displaying error rate trends
 * 
 * @component
 * @param {Object} props - Component props
 * @param {ErrorTrendDataPoint[]} props.data - Error trend data points
 * @param {boolean} [props.isLoading=false] - Loading state indicator
 * @param {number} [props.height=300] - Chart height in pixels
 */
export const ErrorRateChart: React.FC<ErrorRateChartProps> = ({ 
  data,
  isLoading = false,
  height = 300
}) => {
  if (isLoading) {
    return <ChartLoadingState height={height} />;
  }
  
  if (data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center text-muted-foreground"
        style={{ height }}
      >
        No error rate data available
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Error Rate Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#888" strokeOpacity={0.2} />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.3}
              activeDot={{ r: 6 }}
              name="Total Errors"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ErrorRateChart;
