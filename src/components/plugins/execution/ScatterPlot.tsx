import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface ScatterDataPoint {
  execution_time: number;
  xp_earned: number;
  status: string;
  date: string;
}

interface ScatterPlotProps {
  data: ScatterDataPoint[];
}

/**
 * ScatterPlot component for visualizing execution data points
 */
export const ScatterPlot: React.FC<ScatterPlotProps> = ({ data }) => {
  return (
    <div className="h-[400px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="execution_time"
            name="Execution Time"
            unit="s"
          />
          <YAxis
            type="number"
            dataKey="xp_earned"
            name="XP Earned"
            unit=" XP"
          />
          <ZAxis type="category" dataKey="date" name="Date" />
          <RechartsTooltip
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(value: any, name: string) => {
              if (name === "Execution Time")
                return [`${value.toFixed(2)}s`, name];
              if (name === "XP Earned") return [`${value} XP`, name];
              return [value, name];
            }}
          />
          <Legend />
          <Scatter name="Execution Performance" data={data} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
