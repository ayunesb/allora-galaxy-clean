
import { KPITrend, TrendDirection } from '@/types/shared';

// Enhanced KPI trend with direction
interface EnhancedKPITrend extends KPITrend {
  direction: TrendDirection;
}

/**
 * Calculate the trend direction based on historical data
 * @param data Array of data points
 * @returns Trend direction
 */
export function calculateTrendDirection(data: KPITrend[]): TrendDirection {
  if (!data || data.length < 2) return 'neutral';
  
  // Use last two data points to determine direction
  const lastPoint = data[data.length - 1];
  const previousPoint = data[data.length - 2];
  
  if (lastPoint.value > previousPoint.value) {
    return 'up';
  } else if (lastPoint.value < previousPoint.value) {
    return 'down';
  } else {
    return 'neutral';
  }
}

/**
 * Calculate the percentage change between two values
 * @param oldValue The old value
 * @param newValue The new value
 * @returns Percentage change as a number
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
}

/**
 * Analyze trends in KPI data
 * @param data Array of KPI data points
 * @returns Analyzed trend data
 */
export function analyzeTrends(data: KPITrend[]): {
  direction: TrendDirection;
  percentageChange: number;
  enhancedData: EnhancedKPITrend[];
} {
  if (!data || data.length === 0) {
    return {
      direction: 'neutral',
      percentageChange: 0,
      enhancedData: []
    };
  }
  
  // Calculate overall trend direction
  const direction = calculateTrendDirection(data);
  
  // Calculate percentage change from first to last data point
  const firstValue = data[0].value;
  const lastValue = data[data.length - 1].value;
  const percentageChange = calculatePercentageChange(firstValue, lastValue);
  
  // Enhance data with trend direction for each point
  const enhancedData: EnhancedKPITrend[] = data.map((point, index) => {
    let pointDirection: TrendDirection = 'neutral';
    
    if (index > 0) {
      const prevValue = data[index - 1].value;
      if (point.value > prevValue) {
        pointDirection = 'up';
      } else if (point.value < prevValue) {
        pointDirection = 'down';
      }
    }
    
    return {
      ...point,
      direction: pointDirection
    };
  });
  
  return {
    direction,
    percentageChange,
    enhancedData
  };
}
