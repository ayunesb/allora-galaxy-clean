
import { supabase } from '@/integrations/supabase/client';
import { TrendDirection, KPITrend } from '@/types/shared';

/**
 * Analyzes trends for a specific KPI metric
 * @param tenantId The tenant ID to analyze trends for
 * @param metricName The name of the metric to analyze
 * @param days Number of days to analyze
 * @returns Trend data including direction and percentage change
 */
export async function analyzeTrends(
  tenantId: string,
  metricName: string,
  days: number = 30
): Promise<KPITrend | null> {
  try {
    // Get the current value
    const { data: currentData } = await supabase
      .from('kpis')
      .select('value')
      .eq('tenant_id', tenantId)
      .eq('name', metricName)
      .order('date', { ascending: false })
      .limit(1)
      .single();
    
    if (!currentData) return null;
    
    // Get the historical value
    const historicalDate = new Date();
    historicalDate.setDate(historicalDate.getDate() - days);
    
    const { data: historicalData } = await supabase
      .from('kpis')
      .select('value')
      .eq('tenant_id', tenantId)
      .eq('name', metricName)
      .lt('date', historicalDate.toISOString())
      .order('date', { ascending: false })
      .limit(1)
      .single();
    
    if (!historicalData) {
      // No historical data, so trend is neutral
      return {
        direction: 'neutral',
        percentage: 0,
        isPositive: false
      };
    }
    
    const currentValue = currentData.value;
    const historicalValue = historicalData.value;
    const difference = currentValue - historicalValue;
    
    // Calculate percentage change
    let percentage = 0;
    if (historicalValue !== 0) {
      percentage = (difference / Math.abs(historicalValue)) * 100;
    }
    
    // Determine trend direction
    let direction: TrendDirection;
    let isPositive: boolean;
    
    if (Math.abs(percentage) < 1) {
      direction = 'neutral';
      isPositive = false;
    } else if (percentage > 0) {
      direction = 'up';
      isPositive = true;
    } else {
      direction = 'down';
      isPositive = false;
    }
    
    return {
      direction,
      percentage: Math.abs(percentage),
      isPositive
    };
  } catch (error) {
    console.error('Error analyzing trends:', error);
    return null;
  }
}
