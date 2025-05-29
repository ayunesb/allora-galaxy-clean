import React from "react";
import { ErrorTrendDataPoint } from "@/types/logs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import ChartLoadingState from "./ChartLoadingState";

interface ErrorSeverityChartProps {
  data: ErrorTrendDataPoint[];
  isLoading?: boolean;
  height?: number;
}

/**
 * Chart component for displaying error severity breakdown
 *
 * @component
 * @param {Object} props - Component props
 * @param {ErrorTrendDataPoint[]} props.data - Error trend data points
 * @param {boolean} [props.isLoading=false] - Loading state indicator
 * @param {number} [props.height=300] - Chart height in pixels
 */
export const ErrorSeverityChart: React.FC<ErrorSeverityChartProps> = ({
  data,
  isLoading = false,
  height = 300,
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
        No error severity data available
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">
          Error Severity Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            stackOffset="expand"
            barSize={20}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#888"
              strokeOpacity={0.2}
            />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="critical"
              name="Critical"
              stackId="severity"
              fill="#ef4444"
            />
            <Bar dataKey="high" name="High" stackId="severity" fill="#f97316" />
            <Bar
              dataKey="medium"
              name="Medium"
              stackId="severity"
              fill="#eab308"
            />
            <Bar dataKey="low" name="Low" stackId="severity" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ErrorSeverityChart;
