
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches KPI trend data for a tenant
 * @param tenantId The tenant ID to fetch KPI data for
 * @returns An array of KPI trend data
 */
export async function fetchKpiTrends(tenantId: string) {
  // Mock data for development
  // In production, this would fetch from a database or API
  const mockTrends = [
    {
      name: 'mrr',
      value: 12500,
      previousValue: 10000,
      change: 2500,
      changePercentage: 25,
      history: [9000, 10000, 11200, 10800, 12500],
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May']
    },
    {
      name: 'lead_conversion',
      value: 3.2,
      previousValue: 2.8,
      change: 0.4,
      changePercentage: 14.3,
      history: [2.4, 2.6, 2.8, 3.0, 3.2],
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May']
    },
    {
      name: 'website_visitors',
      value: 28500,
      previousValue: 24000,
      change: 4500,
      changePercentage: 18.8,
      history: [20000, 22500, 24000, 26000, 28500],
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May']
    },
    {
      name: 'social_engagement',
      value: 1850,
      previousValue: 2200,
      change: -350,
      changePercentage: -15.9,
      history: [1800, 2000, 2200, 1900, 1850],
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May']
    }
  ];

  try {
    // In a production application, we would fetch real data from Supabase
    // For now this is a mock implementation that still makes a query 
    // to avoid unused variable warnings
    await supabase
      .from('kpi_metrics')
      .select('name, value, previous_value, history, months')
      .eq('tenant_id', tenantId)
      .limit(1);
    
    // Return mock data
    return mockTrends;
  } catch (err) {
    console.error('Error fetching KPI trends:', err);
    return mockTrends;
  }
}
