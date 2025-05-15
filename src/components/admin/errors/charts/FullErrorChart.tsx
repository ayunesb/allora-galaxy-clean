
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface FullErrorChartProps {
  data: Array<{
    date: string;
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    [key: string]: any;
  }>;
}

const FullErrorChart: React.FC<FullErrorChartProps> = ({ data }) => {
  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
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

export default FullErrorChart;
