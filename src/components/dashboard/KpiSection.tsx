
import React from 'react';
import KPICard from '@/components/KPICard';
import { TrendDirection } from '@/types/shared';
import { KPICardSkeleton } from '@/components/skeletons/KPICardSkeleton';

interface KpiData {
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changePercentage: number;
}

interface KpiSectionProps {
  kpiData: KpiData[];
  isLoading: boolean;
}

export const KpiSection: React.FC<KpiSectionProps> = ({ kpiData, isLoading }) => {
  // Format trend data for KPI cards
  const getKpiTrend = (name: string): { value: number; trendDirection: TrendDirection; percentage: number } => {
    const kpi = kpiData.find(k => k.name === name);
    if (!kpi) {
      return { value: 0, trendDirection: 'neutral', percentage: 0 };
    }
    
    const currentValue = kpi.value || 0;
    const previousValue = kpi.previousValue || 0;
    
    if (previousValue === 0) {
      return { value: currentValue, trendDirection: 'neutral', percentage: 0 };
    }
    
    const percentage = ((currentValue - previousValue) / previousValue) * 100;
    const trendDirection: TrendDirection = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral';
    
    return {
      value: currentValue,
      trendDirection,
      percentage: Math.abs(percentage)
    };
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(index => <KPICardSkeleton key={index} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* MRR KPI Card */}
      <KPICard
        title="Monthly Recurring Revenue"
        value={`$${getKpiTrend('mrr').value.toLocaleString()}`}
        trend={getKpiTrend('mrr').percentage}
        trendDirection={getKpiTrend('mrr').trendDirection}
      />
      
      {/* Lead Conversion KPI Card */}
      <KPICard
        title="Lead Conversion"
        value={`${getKpiTrend('lead_conversion').value.toFixed(1)}%`}
        trend={getKpiTrend('lead_conversion').percentage}
        trendDirection={getKpiTrend('lead_conversion').trendDirection}
      />
      
      {/* Website Visitors KPI Card */}
      <KPICard
        title="Website Visitors"
        value={getKpiTrend('website_visitors').value.toLocaleString()}
        trend={getKpiTrend('website_visitors').percentage}
        trendDirection={getKpiTrend('website_visitors').trendDirection}
      />
      
      {/* Social Engagement KPI Card */}
      <KPICard
        title="Social Engagement"
        value={getKpiTrend('social_engagement').value.toLocaleString()}
        trend={getKpiTrend('social_engagement').percentage}
        trendDirection={getKpiTrend('social_engagement').trendDirection}
      />
    </div>
  );
};
