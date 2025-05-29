import { useRef, useEffect } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

interface BarChartProps {
  data: any[];
  width?: number;
  height?: number;
  xAxisKey?: string;
  barKeys?: string[];
  colors?: string[];
}

const BarChartComponent: React.FC<BarChartProps> = ({
  data,
  width = 600,
  height = 300,
  xAxisKey,
  barKeys,
  colors,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // You can add any initialization or dynamic behavior here
  }, [data, width, height, xAxisKey, barKeys, colors]);

  return (
    <div
      ref={chartRef}
      style={{
        width: "100%",
        height: "100%",
        minWidth: "300px",
        minHeight: "150px",
      }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {barKeys?.map((key, index) => (
            <Bar key={key} dataKey={key} fill={colors?.[index] || "#8884d8"} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;
