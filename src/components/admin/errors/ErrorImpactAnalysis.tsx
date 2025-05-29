import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";

interface ErrorImpactData {
  name: string;
  value: number;
}

interface ErrorImpactAnalysisProps {
  data: ErrorImpactData[];
  isLoading?: boolean;
}

const ErrorImpactAnalysis: React.FC<ErrorImpactAnalysisProps> = ({
  data,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Impact by Feature</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Impact by Feature</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">No impact data available</p>
          </div>
        ) : (
          <div className="h-64">
            <Chart
              type="pie"
              data={data}
              dataKeys={["value"]} // Changed from dataKey to dataKeys array
              xKey="name" // Changed from nameKey to xKey
              colors={["#f43f5e", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"]}
              tooltipFormatter={(value: number) => [
                `${value} errors`,
                "Errors",
              ]}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ErrorImpactAnalysis;
