
import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Loader2 } from 'lucide-react';
import type { SystemLog } from '@/types/logs';
import { format, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';

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
  const chartData = useMemo(() => {
    if (!dateRange.to) return [];
    
    // Generate all days in the range
    const days = eachDayOfInterval({
      start: dateRange.from,
      end: dateRange.to
    });
    
    // Prepare data for each day
    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const dayFormatted = format(day, 'MMM dd');
      
      // Filter logs for this day
      const dayLogs = logs.filter(log => {
        const logDate = new Date(log.created_at);
        return logDate >= dayStart && logDate <= dayEnd;
      });
      
      // Count errors by severity
      const criticalCount = dayLogs.filter(log => log.severity === 'critical').length;
      const highCount = dayLogs.filter(log => log.severity === 'high').length;
      const mediumCount = dayLogs.filter(log => log.severity === 'medium').length;
      const lowCount = dayLogs.filter(log => log.severity === 'low').length;
      
      // Count error types
      const errorTypes: Record<string, number> = {};
      dayLogs.forEach(log => {
        const errorType = log.error_type || 'unknown';
        errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
      });
      
      // Get top error types
      const topErrorTypes = Object.entries(errorTypes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as Record<string, number>);
      
      return {
        date: dayFormatted,
        total: dayLogs.length,
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
        ...topErrorTypes
      };
    });
  }, [logs, dateRange]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (type === 'rate') {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
  
  if (type === 'severity') {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="critical" stackId="a" fill="#ff4d4f" />
            <Bar dataKey="high" stackId="a" fill="#faad14" />
            <Bar dataKey="medium" stackId="a" fill="#1890ff" />
            <Bar dataKey="low" stackId="a" fill="#52c41a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
  
  // Full chart with both lines and bars
  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="total"
            name="Total Errors"
            stroke="#8884d8"
            strokeWidth={2}
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="critical"
            name="Critical"
            stroke="#ff4d4f"
            strokeDasharray="5 5"
          />
          <Line
            type="monotone"
            dataKey="high"
            name="High"
            stroke="#faad14"
            strokeDasharray="3 3"
          />
          <Line
            type="monotone"
            dataKey="medium"
            name="Medium"
            stroke="#1890ff"
            strokeDasharray="3 3"
          />
          <Line
            type="monotone"
            dataKey="low"
            name="Low"
            stroke="#52c41a"
            strokeDasharray="3 3"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ErrorTrendsChart;
