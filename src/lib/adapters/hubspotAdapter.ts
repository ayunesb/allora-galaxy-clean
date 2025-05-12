
/**
 * HubSpot API adapter for Allora
 * Handles data fetching and transformation from HubSpot
 */

import type { KPI } from '@/types/shared';

export interface HubspotContact {
  id: string;
  properties: {
    email: string;
    firstname?: string;
    lastname?: string;
    hs_lead_status?: string;
    createdate?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface HubspotMQLsResponse {
  results: HubspotContact[];
  paging?: {
    next?: {
      link: string;
    };
  };
  total?: number;
}

export interface HubspotMQLResult {
  mql_count: number;
  high_quality_count: number;
  mql_to_sql_rate: number;
  previous_mql_count?: number | null;
  recent_leads: Array<{
    id: string;
    email: string;
    name: string;
    status: string;
    score: number;
    created_at: string;
    source?: string;
  }>;
}

/**
 * Fetch Marketing Qualified Leads from HubSpot
 * @param apiKey HubSpot API key
 * @returns MQL data including counts and recent leads
 */
export async function fetchMQLsFromHubspot(apiKey: string): Promise<HubspotMQLResult> {
  try {
    // Fetch MQLs with the MQL status
    const response = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts?properties=hs_lead_status,email,firstname,lastname,createdate,hs_lead_score,source&filterGroups=[{\"filters\":[{\"propertyName\":\"hs_lead_status\",\"operator\":\"EQ\",\"value\":\"MQL\"}]}]", 
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HubSpot API returned ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json() as HubspotMQLsResponse;
    
    // Transform the response into our data structure
    const mql_count = data.total || data.results?.length || 0;
    
    // Calculate high-quality MQLs (those with lead score > 70)
    const high_quality_count = data.results?.filter(
      contact => parseInt(contact.properties.hs_lead_score || '0', 10) > 70
    ).length || 0;
    
    // Fetch SQL count to calculate conversion rate
    const sqlResponse = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts?properties=hs_lead_status&filterGroups=[{\"filters\":[{\"propertyName\":\"hs_lead_status\",\"operator\":\"EQ\",\"value\":\"SQL\"}]}]&count=1", 
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );
    
    let mql_to_sql_rate = 0;
    if (sqlResponse.ok) {
      const sqlData = await sqlResponse.json() as HubspotMQLsResponse;
      const sql_count = sqlData.total || 0;
      
      // Calculate conversion rate as a percentage (avoid divide by zero)
      mql_to_sql_rate = mql_count > 0 ? Math.round((sql_count / mql_count) * 100) : 0;
    }
    
    // Transform 10 most recent leads for display
    const recent_leads = data.results?.slice(0, 10).map(contact => ({
      id: contact.id,
      email: contact.properties.email,
      name: `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim() || 'Unknown',
      status: contact.properties.hs_lead_status || 'MQL',
      score: parseInt(contact.properties.hs_lead_score || '0', 10),
      created_at: contact.properties.createdate || new Date().toISOString(),
      source: contact.properties.source
    })) || [];
    
    return {
      mql_count,
      high_quality_count,
      mql_to_sql_rate,
      recent_leads
    };
  } catch (error) {
    console.error("Error fetching MQLs from HubSpot:", error);
    throw error;
  }
}

/**
 * Format MQL data into KPI records ready to be inserted into the database
 * @param tenant_id The tenant ID
 * @param mqlData MQL data from HubSpot
 * @param previousValues Previous KPI values for comparison
 * @returns Array of KPI objects ready for insertion
 */
export function formatMQLsAsKPIs(
  tenant_id: string,
  mqlData: HubspotMQLResult,
  previousValues: Record<string, number | null> = {}
): KPI[] {
  const today = new Date().toISOString().split('T')[0];
  
  return [
    {
      tenant_id,
      name: 'Marketing Qualified Leads',
      value: mqlData.mql_count,
      previous_value: previousValues['mql_count'] ?? null,
      category: 'marketing',
      source: 'hubspot',
      unit: 'count',
      date: today,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      tenant_id,
      name: 'High Quality MQLs',
      value: mqlData.high_quality_count,
      previous_value: previousValues['high_quality'] ?? null,
      category: 'marketing',
      source: 'hubspot',
      unit: 'count',
      date: today,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      tenant_id,
      name: 'MQL to SQL Conversion Rate',
      value: mqlData.mql_to_sql_rate,
      previous_value: previousValues['conversion_rate'] ?? null,
      category: 'marketing',
      source: 'hubspot',
      unit: 'percentage',
      date: today,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
}
