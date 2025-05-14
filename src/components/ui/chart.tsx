
import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

export interface ChartProps {
  data: any[];
  type: 'bar' | 'line' | 'pie' | 'area';
  xKey?: string;
  dataKeys: string[];
  colors?: string[];
  height?: number;
  className?: string;
  stackId?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  tooltipFormatter?: (value: any, name: string) => [string, string];
  labelFormatter?: (value: any) => string;
}

/**
 * Chart - A unified chart component that renders different chart types
 * based on the 'type' prop.
 */
export const Chart: React.FC<ChartProps> = ({
  data,
  type,
  xKey = 'name',
  dataKeys,
  colors = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#f43f5e', '#ec4899'],
  height = 300,
  className = '',
  stackId,
  showGrid = true,
  showLegend = true,
  tooltipFormatter,
  labelFormatter,
}) => {
  // Default TAILWIND colors if colors aren't provided
  const defaultColors = [
    'var(--primary)', 
    'var(--secondary)',
    'var(--accent)',
    'var(--destructive)',
    'var(--muted)',
    'var(--card)'
  ];

  const chartColors = colors.length > 0 ? colors : defaultColors;

  // Ensure we have enough colors
  while (chartColors.length < dataKeys.length) {
    chartColors.push(...defaultColors);
  }

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip formatter={tooltipFormatter} labelFormatter={labelFormatter} />
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                stackId={stackId}
                fill={chartColors[index % chartColors.length]}
              />
            ))}
          </BarChart>
        );

      case 'line':
        return (
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip formatter={tooltipFormatter} labelFormatter={labelFormatter} />
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={chartColors[index % chartColors.length]}
                activeDot={{ r: 8 }}
              />
            ))}
          </LineChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKeys[0]}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={tooltipFormatter} labelFormatter={labelFormatter} />
            {showLegend && <Legend />}
          </PieChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip formatter={tooltipFormatter} labelFormatter={labelFormatter} />
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId={stackId}
                stroke={chartColors[index % chartColors.length]}
                fill={chartColors[index % chartColors.length]}
              />
            ))}
          </AreaChart>
        );

      default:
        return <div>Unsupported chart type: {type}</div>;
    }
  };

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
