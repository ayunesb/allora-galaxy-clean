
import React from 'react';
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface BarChartProps {
  data: any[];
  index: string;
  categories: string[];
  colors?: string[];
  yAxisWidth?: number;
  className?: string;
  showLegend?: boolean;
  showGrid?: boolean;
}

export function BarChart({
  data,
  index,
  categories,
  colors = ['#2563eb', '#16a34a', '#ea580c', '#8b5cf6'],
  yAxisWidth = 50,
  className,
  showLegend = false,
  showGrid = true,
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <RechartsBarChart
        data={data}
        margin={{
          top: 10,
          right: 10,
          left: 0,
          bottom: 30,
        }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
        <XAxis
          dataKey={index}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          width={yAxisWidth}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
            borderRadius: '8px',
            boxShadow: 'hsl(var(--shadow) / 20%) 0px 5px 15px',
          }}
          itemStyle={{
            fontSize: '12px',
            color: 'hsl(var(--foreground))',
          }}
        />
        {showLegend && <Legend />}
        {categories.map((category, i) => (
          <Bar
            key={category}
            dataKey={category}
            fill={colors[i % colors.length]}
            radius={[4, 4, 0, 0]}
            barSize={30}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
