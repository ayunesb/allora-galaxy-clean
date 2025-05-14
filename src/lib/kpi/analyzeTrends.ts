
import { KPI } from '@/types/kpi';
import { KPITrend, TrendDirection } from '@/types/shared';

/**
 * Calculate percentage change between two numbers
 */
export const calculatePercentChange = (current: number, previous: number): number => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
};

/**
 * Determine trend direction based on percentage change
 */
export const determineTrendDirection = (percentChange: number): TrendDirection => {
  if (percentChange > 0) return 'up';
  if (percentChange < 0) return 'down';
  return 'flat';
};

/**
 * Analyze KPI trend by comparing current and previous values
 */
export const analyzeKpiTrend = (kpi: KPI): KPITrend => {
  const currentValue = kpi.value || 0;
  const previousValue = kpi.previous_value || 0;
  
  const percentChange = calculatePercentChange(currentValue, previousValue);
  const direction = determineTrendDirection(percentChange);
  
  return {
    currentValue,
    previousValue,
    percentChange,
    direction
  };
};

/**
 * Group KPIs by name and analyze trends for each group
 */
export const groupAndAnalyzeKpis = (kpis: KPI[]): Map<string, KPITrend> => {
  const kpiTrends = new Map<string, KPITrend>();
  
  kpis.forEach(kpi => {
    const trend = analyzeKpiTrend(kpi);
    kpiTrends.set(kpi.name, trend);
  });
  
  return kpiTrends;
};

/**
 * Get latest KPI values grouped by name
 */
export const getLatestKpiValues = (kpis: KPI[]): Map<string, KPI> => {
  const latest = new Map<string, KPI>();
  const kpisByName = new Map<string, KPI[]>();
  
  // Group KPIs by name
  kpis.forEach(kpi => {
    if (!kpisByName.has(kpi.name)) {
      kpisByName.set(kpi.name, []);
    }
    kpisByName.get(kpi.name)?.push(kpi);
  });
  
  // Find latest KPI for each name
  kpisByName.forEach((kpiGroup, name) => {
    const sortedKpis = kpiGroup.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    if (sortedKpis.length > 0) {
      latest.set(name, sortedKpis[0]);
    }
  });
  
  return latest;
};

/**
 * Find KPI by name from a list
 */
export const findKpiByName = (kpis: KPI[], name: string): KPI | undefined => {
  return kpis.find(kpi => kpi.name === name);
};

/**
 * Calculate a composite financial health score based on multiple KPIs
 */
export const calculateFinancialHealthScore = (kpis: KPI[]): number => {
  // Find relevant KPIs
  const mrr = findKpiByName(kpis, 'Monthly Recurring Revenue');
  const cac = findKpiByName(kpis, 'Customer Acquisition Cost');
  const churnRate = findKpiByName(kpis, 'Churn Rate');
  
  let score = 50; // Default middle score
  
  // Adjust score based on MRR trend
  if (mrr && mrr.previous_value) {
    const mrrPercentChange = calculatePercentChange(mrr.value, mrr.previous_value);
    score += mrrPercentChange > 0 ? 10 : -10;
  }
  
  // Adjust score based on CAC
  if (cac && mrr) {
    // Lower CAC is better
    const cacToMrr = cac.value / mrr.value;
    if (cacToMrr < 0.3) score += 10;
    else if (cacToMrr > 0.7) score -= 10;
  }
  
  // Adjust score based on churn
  if (churnRate) {
    if (churnRate.value < 3) score += 10;
    else if (churnRate.value > 8) score -= 10;
  }
  
  // Ensure score stays within 0-100 range
  return Math.max(0, Math.min(100, score));
};

/**
 * Format KPI trend for display
 */
export const formatKpiTrendForDisplay = (trend: KPITrend): {
  displayValue: string;
  displayChange: string;
  trendDirection: TrendDirection;
} => {
  return {
    displayValue: trend.currentValue.toLocaleString(),
    displayChange: `${trend.percentChange >= 0 ? '+' : ''}${trend.percentChange.toFixed(1)}%`,
    trendDirection: trend.direction
  };
};
