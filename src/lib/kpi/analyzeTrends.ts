
import { KPITrend, TrendDirection } from "@/types/shared";

interface KPI {
  id: string;
  name: string;
  value: number;
  previousValue: number | null;
  category: string;
  unit: string;
}

export function analyzeTrends(kpis: KPI[]): KPITrend[] {
  return kpis.map(kpi => {
    const previousValue = kpi.previousValue || 0;
    const change = previousValue === 0 
      ? 0 
      : ((kpi.value - previousValue) / previousValue) * 100;
    
    let direction: TrendDirection = 'stable';
    if (change > 0) direction = 'up';
    else if (change < 0) direction = 'down';
    
    // Determine if the trend is positive (depends on the metric)
    // For most metrics, up is good, but for some (like cost), down is good
    const costMetrics = ['cost', 'expense', 'churn', 'bounce_rate'];
    const isPositive = costMetrics.some(m => kpi.name.toLowerCase().includes(m)) 
      ? change < 0 
      : change > 0;
    
    return {
      value: kpi.value,
      previousValue,
      percentChange: Math.abs(change),
      direction,
      isPositive
    };
  });
}
