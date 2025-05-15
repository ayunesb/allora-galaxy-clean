
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ErrorSeverityChartProps {
  data: Array<{
    date: string;
    critical: number;
    high: number;
    medium: number;
    low: number;
    [key: string]: any;
  }>;
}

const ErrorSeverityChart: React.FC<ErrorSeverityChartProps> = ({ data }) => {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
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
};

export default ErrorSeverityChart;
