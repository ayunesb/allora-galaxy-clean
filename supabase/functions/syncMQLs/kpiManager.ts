
import { MQLResult } from "./hubspotAdapter.ts";

/**
 * Process and store MQL data as KPIs in the database
 * @param supabase Initialized Supabase client
 * @param tenantId The tenant ID
 * @param mqlData MQL data from HubSpot
 * @returns Object with KPI processing results
 */
export async function processMQLKPIs(
  supabase: any,
  tenantId: string,
  mqlData: MQLResult
): Promise<{
  mql_count: number;
  previous_mql_count?: number;
  high_quality_count: number;
  mql_to_sql_rate: number;
  kpi_count: number;
  leads_count: number;
}> {
  // Get previous KPI values for comparison
  const { data: prevMql } = await supabase
    .from('kpis')
    .select('value')
    .eq('tenant_id', tenantId)
    .eq('name', 'Marketing Qualified Leads')
    .eq('source', 'hubspot')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
    
  const { data: prevHighQuality } = await supabase
    .from('kpis')
    .select('value')
    .eq('tenant_id', tenantId)
    .eq('name', 'High Quality MQLs')
    .eq('source', 'hubspot')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
    
  const { data: prevConversion } = await supabase
    .from('kpis')
    .select('value')
    .eq('tenant_id', tenantId)
    .eq('name', 'MQL to SQL Conversion Rate')
    .eq('source', 'hubspot')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  const today = new Date().toISOString().split('T')[0];
  
  // Prepare KPI records for insertion
  const kpis = [
    {
      tenant_id: tenantId,
      name: 'Marketing Qualified Leads',
      value: mqlData.mql_count,
      previous_value: prevMql?.value || null,
      category: 'marketing',
      source: 'hubspot',
      date: today
    },
    {
      tenant_id: tenantId,
      name: 'High Quality MQLs',
      value: mqlData.high_quality_count,
      previous_value: prevHighQuality?.value || null,
      category: 'marketing',
      source: 'hubspot',
      date: today
    },
    {
      tenant_id: tenantId,
      name: 'MQL to SQL Conversion Rate',
      value: mqlData.mql_to_sql_rate,
      previous_value: prevConversion?.value || null,
      category: 'marketing',
      source: 'hubspot',
      date: today
    }
  ];
  
  // Insert KPIs
  const { error: kpiError } = await supabase
    .from('kpis')
    .upsert(kpis, { onConflict: 'tenant_id,name,date' });
  
  if (kpiError) {
    throw new Error(`Failed to save KPIs: ${kpiError.message}`);
  }
  
  // Try to store lead data if the leads table exists
  await storeLeadData(supabase, tenantId, mqlData.recent_leads);
  
  // Return the KPI processing results
  return {
    mql_count: mqlData.mql_count,
    previous_mql_count: prevMql?.value,
    high_quality_count: mqlData.high_quality_count,
    mql_to_sql_rate: mqlData.mql_to_sql_rate,
    kpi_count: kpis.length,
    leads_count: mqlData.recent_leads.length
  };
}

/**
 * Store sample lead data in the database
 * @param supabase Initialized Supabase client
 * @param tenantId The tenant ID
 * @param leads Array of lead data to store
 */
async function storeLeadData(
  supabase: any,
  tenantId: string,
  leads: Array<any>
): Promise<void> {
  try {
    const { error: leadsInsertError } = await supabase
      .from('leads')
      .upsert(
        leads.map(lead => ({
          ...lead,
          tenant_id: tenantId
        })),
        { onConflict: 'id' }
      );
    
    if (leadsInsertError && leadsInsertError.code !== '42P01') {
      console.warn(`Could not update leads table: ${leadsInsertError.message}`);
    }
  } catch (leadsError) {
    // Leads table might not exist, which is fine
    console.warn(`Leads operation error: ${leadsError}`);
  }
}
