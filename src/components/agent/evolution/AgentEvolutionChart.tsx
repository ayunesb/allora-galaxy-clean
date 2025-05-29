import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { AgentEvolutionHistory } from "@/types/agent";

interface AgentEvolutionChartProps {
  history: AgentEvolutionHistory[];
}

export const AgentEvolutionChart: React.FC<AgentEvolutionChartProps> = ({
  history,
}) => {
  // Transform history data for chart
  const chartData = history.map((item) => ({
    version: item.version,
    successRate: item.performance?.successRate
      ? Math.round(item.performance.successRate * 100)
      : 0,
    errorRate: item.performance?.errorRate
      ? Math.round(item.performance.errorRate * 100)
      : 0,
    avgXp: item.performance?.averageXp || 0,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Performance Evolution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
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
              <XAxis dataKey="version" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="successRate"
                name="Success Rate (%)"
                stroke="#10b981"
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="errorRate"
                name="Error Rate (%)"
                stroke="#ef4444"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgXp"
                name="Avg XP"
                stroke="#6366f1"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentEvolutionChart;
