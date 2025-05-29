import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BarChart2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

interface XpHistoryTabProps {
  xpHistoryData: Array<{ date: string; xp: number; count: number }>;
}

const XpHistoryTab: React.FC<XpHistoryTabProps> = ({ xpHistoryData }) => {
  if (xpHistoryData.length === 0) {
    return (
      <EmptyState
        title="No XP history"
        description="This plugin has no execution history to show"
        icon={<BarChart2 className="h-12 w-12" />}
      />
    );
  }

  return (
    <div className="h-[400px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={xpHistoryData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
          <RechartsTooltip
            formatter={(value: any, name: string) => {
              return name === "xp"
                ? [`${value} XP`, "XP Earned"]
                : [value, "Executions"];
            }}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="xp" name="XP Earned" fill="#8884d8" />
          <Bar
            yAxisId="right"
            dataKey="count"
            name="Executions"
            fill="#82ca9d"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default XpHistoryTab;
