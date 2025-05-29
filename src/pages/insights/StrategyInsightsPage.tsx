import React from 'react';
import StrategyTrendChart from '@/components/insights/StrategyTrendChart';
import KPICard from '@/components/insights/KPICard';

export default function StrategyInsightsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Strategy Insights</h1>
      <StrategyTrendChart />
      <KPICard />
    </div>
  );
}