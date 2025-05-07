
import { supabase } from "@/integrations/supabase/client";

interface KpiTrendPoint {
  date: string;
  value: number;
}

/**
 * Fetch KPI trends for a specific metric
 */
export async function fetchKpiTrends(
  tenant_id: string,
  name: string,
  source?: string,
  limit: number = 30
): Promise<KpiTrendPoint[]> {
  try {
    const query = supabase
      .from('kpis')
      .select('date, value')
      .eq('tenant_id', tenant_id)
      .eq('name', name)
      .order('date', { ascending: true })
      .limit(limit);
    
    // Add source filter if provided
    if (source) {
      query.eq('source', source);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching KPI trends:", error);
      return [];
    }
    
    return data as KpiTrendPoint[];
  } catch (error) {
    console.error("Unexpected error in fetchKpiTrends:", error);
    return [];
  }
}

/**
 * Fetch the latest KPI values for a specific category
 */
export async function fetchLatestKpis(
  tenant_id: string,
  category?: 'financial' | 'marketing' | 'sales' | 'product'
) {
  try {
    // This query is a bit complex:
    // For each unique name+source combination, we want the most recent entry
    const { data, error } = await supabase
      .rpc('get_latest_kpis', { 
        p_tenant_id: tenant_id,
        p_category: category || null
      });
    
    if (error) {
      console.error("Error fetching latest KPIs:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Unexpected error in fetchLatestKpis:", error);
    return [];
  }
}
