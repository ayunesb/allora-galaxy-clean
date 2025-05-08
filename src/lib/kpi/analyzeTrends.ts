
import { KPI } from '@/types/index';

export interface KPITrend {
  id: string;
  name: string;
  change: number; // percentage change
  trend: 'up' | 'down' | 'neutral';
  currentValue: number;
  previousValue: number | null;
  unit: string;
  category: string;
}

/**
 * Analyze KPI trends from a set of KPI data
 */
export function analyzeTrends(kpis: KPI[]): KPITrend[] {
  return kpis.map((kpi) => {
    // Calculate the percentage change if previous value exists
    let change = 0;
    let trend: 'up' | 'down' | 'neutral' = 'neutral';
    
    if (kpi.previous_value && kpi.previous_value !== 0) {
      change = ((kpi.value - kpi.previous_value) / kpi.previous_value) * 100;
      trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
    } else if (kpi.previous_value === 0 && kpi.value > 0) {
      // If previous was 0 and now it's positive, it's an infinite increase
      // We'll just use a large number
      change = 100;
      trend = 'up';
    } else if (kpi.value === 0 && kpi.previous_value && kpi.previous_value > 0) {
      // If previous was positive and now it's 0, it's a 100% decrease
      change = -100;
      trend = 'down';
    }
    
    return {
      id: kpi.id,
      name: kpi.name,
      change: Number(change.toFixed(2)),
      trend,
      currentValue: kpi.value,
      previousValue: kpi.previous_value,
      unit: kpi.unit,
      category: kpi.category,
    };
  });
}

/**
 * Calculate the overall health score based on KPI trends
 * Score ranges from 0 (bad) to 100 (excellent)
 */
export function calculateHealthScore(trends: KPITrend[]): number {
  if (trends.length === 0) return 50; // Neutral score if no data
  
  // Calculate weighted score based on trends
  const totalWeight = trends.reduce((sum, trend) => {
    // Assign category weights (revenue metrics are more important)
    const categoryWeight = trend.category.toLowerCase().includes('revenue') ? 2 : 1;
    return sum + categoryWeight;
  }, 0);
  
  const weightedScore = trends.reduce((score, trend) => {
    const categoryWeight = trend.category.toLowerCase().includes('revenue') ? 2 : 1;
    const trendScore = trend.trend === 'up' ? 100 : trend.trend === 'down' ? 0 : 50;
    return score + (trendScore * categoryWeight);
  }, 0);
  
  return Math.round(weightedScore / totalWeight);
}
