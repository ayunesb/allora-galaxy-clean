
import React from 'react';
import { Card } from '@/components/ui/card';
import { KPITrend } from '@/types/kpi';
import KPICard from '@/components/KPICard';
import { KPICardSkeleton } from '@/components/skeletons/KPICardSkeleton';

export interface KpiSectionProps {
  title: string;
  kpis?: KPITrend[];
  isLoading?: boolean;
  className?: string;
  kpiData?: any[];
}

const KpiSection: React.FC<KpiSectionProps> = ({
  title,
  kpis = [],
  kpiData = [],
  isLoading = false,
  className = '',
}) => {
  const dataToRender = kpis.length > 0 ? kpis : kpiData;

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICardSkeleton />
          <KPICardSkeleton />
          <KPICardSkeleton />
          <KPICardSkeleton />
        </div>
      </div>
    );
  }

  if (dataToRender.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <Card className="p-6 text-center text-muted-foreground">
          <p>No KPIs available.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dataToRender.map((kpi, index) => (
          <KPICard 
            key={kpi.id || index}
            title={kpi.name}
            value={kpi.value}
            previous={kpi.previousValue}
            change={kpi.change}
            changePercent={kpi.changePercent}
            direction={kpi.direction}
            trend={kpi.trend}
            unit={kpi.unit}
            target={kpi.target}
          />
        ))}
      </div>
    </div>
  );
};

export default KpiSection;
