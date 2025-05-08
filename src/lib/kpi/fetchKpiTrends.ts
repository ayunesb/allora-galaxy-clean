
import { supabase } from '@/integrations/supabase/client';
import { KpiTrendPoint } from '@/types/shared';

export interface KpiTrendOptions {
  period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  dateRange?: {
    start: Date;
    end: Date;
  };
  limit?: number;
}

/**
 * Fetches KPI trend data for a tenant
 * @param tenantId The tenant ID
 * @param options Optional parameters for fetching KPI data
 * @returns Array of KPI trend data
 */
export async function fetchKpiTrends(tenantId: string, options?: KpiTrendOptions) {
  try {
    // Default options
    const period = options?.period || 'monthly';
    const limit = options?.limit || 12;
    
    // Determine date range based on period
    const now = new Date();
    let startDate = new Date();
    
    if (options?.dateRange) {
      startDate = options.dateRange.start;
    } else {
      // Default date ranges based on period
      switch (period) {
        case 'daily':
          startDate.setDate(startDate.getDate() - limit);
          break;
        case 'weekly':
          startDate.setDate(startDate.getDate() - (limit * 7));
          break;
        case 'monthly':
          startDate.setMonth(startDate.getMonth() - limit);
          break;
        case 'quarterly':
          startDate.setMonth(startDate.getMonth() - (limit * 3));
          break;
        case 'yearly':
          startDate.setFullYear(startDate.getFullYear() - limit);
          break;
      }
    }
    
    // Format dates for DB query
    const startDateStr = startDate.toISOString();
    const endDateStr = options?.dateRange?.end ? options.dateRange.end.toISOString() : now.toISOString();
    
    // Fetch KPIs from database
    const { data, error } = await supabase
      .from('kpis')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .order('date', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    // This is a simplified implementation - in a real app, we'd process the raw
    // KPI data to generate trend information and calculate previous periods
    
    // Simulate KPI data for demonstration purposes
    const mockKpiData = [
      {
        name: 'mrr',
        value: 12500,
        previousValue: 10000,
        change: 2500,
        changePercentage: 25,
        trends: [] as KpiTrendPoint[]
      },
      {
        name: 'lead_conversion',
        value: 3.2,
        previousValue: 2.8,
        change: 0.4,
        changePercentage: 14.3,
        trends: [] as KpiTrendPoint[]
      },
      {
        name: 'website_visitors',
        value: 15400,
        previousValue: 14200,
        change: 1200,
        changePercentage: 8.5,
        trends: [] as KpiTrendPoint[]
      },
      {
        name: 'social_engagement',
        value: 2350,
        previousValue: 1800,
        change: 550,
        changePercentage: 30.6,
        trends: [] as KpiTrendPoint[]
      }
    ];
    
    // In a real implementation, we would process the data from the database
    // and return it instead of the mock data
    
    return mockKpiData;
  } catch (err) {
    console.error('Error fetching KPI trends:', err);
    throw err;
  }
}
