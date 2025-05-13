
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Import environment and error handling utilities
import { safeGetDenoEnv } from "../../lib/env.ts";
import { formatResponse, createErrorResponse } from "../../lib/utils.ts";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define the expected request schema
interface SyncMQLsRequest {
  tenant_id: string;
  hubspot_api_key?: string;
}

// Adapter interfaces
interface HubspotContact {
  id: string;
  properties: {
    email: string;
    firstname?: string;
    lastname?: string;
    hs_lead_status?: string;
    createdate?: string;
    [key: string]: any;
  };
}

interface HubspotMQLsResponse {
  results: HubspotContact[];
  paging?: {
    next?: {
      link: string;
    };
  };
  total?: number;
}

interface MQLResult {
  mql_count: number;
  high_quality_count: number;
  mql_to_sql_rate: number;
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

// Function to fetch MQLs from HubSpot
async function fetchMQLsFromHubspot(apiKey: string): Promise<MQLResult> {
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

serve(async (req) => {
  const startTime = performance.now();
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("syncMQLs: Function started");
    
    // Parse request body
    let requestData: SyncMQLsRequest;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error("syncMQLs: Invalid JSON payload:", error);
      return createErrorResponse(400, "Invalid JSON payload", String(error), startTime);
    }
    
    const { tenant_id, hubspot_api_key: customApiKey } = requestData;
    
    if (!tenant_id) {
      console.error("syncMQLs: Missing tenant_id");
      return createErrorResponse(400, "tenant_id is required", undefined, startTime);
    }

    // Get environment variables
    const supabaseUrl = safeGetDenoEnv('SUPABASE_URL');
    const supabaseServiceKey = safeGetDenoEnv('SUPABASE_SERVICE_ROLE_KEY');
    const defaultHubspotApiKey = safeGetDenoEnv('HUBSPOT_API_KEY');
    
    // Use custom API key if provided, otherwise fall back to the default
    const hubspotApiKey = customApiKey || defaultHubspotApiKey;
    
    if (!hubspotApiKey) {
      console.error("syncMQLs: No HubSpot API key available");
      return createErrorResponse(400, "HubSpot API key is required", undefined, startTime);
    }
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("syncMQLs: Missing Supabase credentials");
      return createErrorResponse(500, "Supabase credentials not configured", undefined, startTime);
    }
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
      console.log(`syncMQLs: Fetching HubSpot data for tenant ${tenant_id}`);
      
      // Fetch MQL data from HubSpot
      const mqlData = await fetchMQLsFromHubspot(hubspotApiKey);
      
      console.log(`syncMQLs: Found ${mqlData.mql_count} MQLs for tenant ${tenant_id}`);
      
      // Get previous KPI values for comparison
      const { data: prevMql } = await supabase
        .from('kpis')
        .select('value')
        .eq('tenant_id', tenant_id)
        .eq('name', 'Marketing Qualified Leads')
        .eq('source', 'hubspot')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      const { data: prevHighQuality } = await supabase
        .from('kpis')
        .select('value')
        .eq('tenant_id', tenant_id)
        .eq('name', 'High Quality MQLs')
        .eq('source', 'hubspot')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      const { data: prevConversion } = await supabase
        .from('kpis')
        .select('value')
        .eq('tenant_id', tenant_id)
        .eq('name', 'MQL to SQL Conversion Rate')
        .eq('source', 'hubspot')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      const today = new Date().toISOString().split('T')[0];
      
      // Prepare KPI records for insertion
      const kpis = [
        {
          tenant_id,
          name: 'Marketing Qualified Leads',
          value: mqlData.mql_count,
          previous_value: prevMql?.value || null,
          category: 'marketing',
          source: 'hubspot',
          date: today
        },
        {
          tenant_id,
          name: 'High Quality MQLs',
          value: mqlData.high_quality_count,
          previous_value: prevHighQuality?.value || null,
          category: 'marketing',
          source: 'hubspot',
          date: today
        },
        {
          tenant_id,
          name: 'MQL to SQL Conversion Rate',
          value: mqlData.mql_to_sql_rate,
          previous_value: prevConversion?.value || null,
          category: 'marketing',
          source: 'hubspot',
          date: today
        }
      ];
      
      // Insert KPIs
      const { data: kpiResults, error: kpiError } = await supabase
        .from('kpis')
        .upsert(kpis, { onConflict: 'tenant_id,name,date' });
      
      if (kpiError) {
        throw new Error(`Failed to save KPIs: ${kpiError.message}`);
      }
      
      // Store sample lead data if leads table exists
      try {
        const { error: leadsInsertError } = await supabase
          .from('leads')
          .upsert(
            mqlData.recent_leads.map(lead => ({
              ...lead,
              tenant_id
            })),
            { onConflict: 'id' }
          );
        
        if (leadsInsertError && leadsInsertError.code !== '42P01') {
          console.warn(`syncMQLs: Could not update leads table: ${leadsInsertError.message}`);
        }
      } catch (leadsError) {
        // Leads table might not exist, which is fine
        console.warn(`syncMQLs: Leads operation error: ${leadsError}`);
      }
      
      // Log system event
      await supabase
        .from('system_logs')
        .insert({
          tenant_id,
          module: 'marketing',
          event: 'mql_sync_complete',
          context: {
            kpi_names: kpis.map(k => k.name),
            mql_count: mqlData.mql_count,
            high_quality_count: mqlData.high_quality_count,
            conversion_rate: mqlData.mql_to_sql_rate
          }
        });
      
      // Return success response
      return formatResponse({
        success: true,
        message: `HubSpot MQLs synced successfully`,
        data: {
          mql_count: mqlData.mql_count,
          previous_mql_count: prevMql?.value,
          high_quality_count: mqlData.high_quality_count,
          mql_to_sql_rate: mqlData.mql_to_sql_rate,
          kpi_count: kpis.length,
          leads_count: mqlData.recent_leads.length
        }
      }, startTime);
    } catch (error: any) {
      console.error(`syncMQLs: Error processing tenant ${tenant_id}:`, error);
      
      // Log error to system logs
      try {
        await supabase
          .from('system_logs')
          .insert({
            tenant_id,
            module: 'marketing',
            event: 'mql_sync_failed',
            context: { 
              error: error.message || String(error)
            }
          });
      } catch (logError) {
        console.error(`syncMQLs: Failed to log error:`, logError);
      }
      
      return createErrorResponse(
        500,
        "Failed to sync MQLs from HubSpot",
        error.message || String(error),
        startTime
      );
    }
  } catch (error: any) {
    console.error("syncMQLs: Unhandled error:", error);
    return createErrorResponse(
      500,
      "Unhandled error in syncMQLs function",
      error.message || String(error),
      startTime
    );
  }
});

// Helper functions
function formatResponse(data: any, startTime: number) {
  const executionTime = (performance.now() - startTime) / 1000;
  return new Response(
    JSON.stringify({
      ...data,
      execution_time: executionTime
    }),
    { 
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json" 
      } 
    }
  );
}

function createErrorResponse(status: number, message: string, details?: string, startTime?: number) {
  const executionTime = startTime ? (performance.now() - startTime) / 1000 : 0;
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      details,
      execution_time: executionTime
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
}
