import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface KpiSectionProps {
  title: string;
  children?: React.ReactNode;
  kpiData?: any[];
  isLoading?: boolean;
}

export const KpiSection: React.FC<KpiSectionProps> = ({
  title,
  children,
  kpiData = [],
  isLoading = false,
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading KPI data...</p>
        )}

        {!isLoading && kpiData && kpiData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {kpiData.map((kpi, index) => (
              <div key={index} className="p-4 bg-muted rounded-md">
                <div className="text-sm text-muted-foreground">{kpi.name}</div>
                <div className="text-2xl font-bold">{kpi.value}</div>
              </div>
            ))}
          </div>
        )}

        {!isLoading &&
          (!kpiData || kpiData.length === 0) &&
          (children || (
            <p className="text-sm text-muted-foreground">
              No KPI data available.
            </p>
          ))}
      </CardContent>
    </Card>
  );
};

export default KpiSection;
