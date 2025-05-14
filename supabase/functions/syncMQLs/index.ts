
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Import environment and error handling utilities
import { getEnv, validateEnv } from "../../lib/env.ts";
import { corsHeaders } from "../_shared/edgeUtils.ts";

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

// RETRY CONFIG
const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY_MS: 500,
  BACKOFF_FACTOR: 2
};

/**
 * Execute a function with retry logic
 */
async function executeWithRetry<T>(
  operation: () => Promise<T>, 
  operationName: string
): Promise<T> {
  let retryCount = 0;
  let lastError: Error | null = null;

  while (retryCount < RETRY_CONFIG.MAX_RETRIES) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Determine if error is retryable
      const isRetryable = error.message?.includes('network') || 
                          error.message?.includes('timeout') || 
                          error.message?.includes('connection') ||
                          error.status === 503 || 
                          error.status === 429;
      
      if (!isRetryable) {
        console.error(`Non-retryable error for ${operationName}:`, error);
        throw error;
      }
      
      retryCount++;
      
      if (retryCount >= RETRY_CONFIG.MAX_RETRIES) {
        console.error(`Max retries (${RETRY_CONFIG.MAX_RETRIES}) reached for ${operationName}`);
        throw new Error(`Failed after ${RETRY_CONFIG.MAX_RETRIES} attempts: ${error.message}`);
      }
      
      // Calculate backoff delay with jitter
      const baseDelay = RETRY_CONFIG.INITIAL_DELAY_MS * Math.pow(RETRY_CONFIG.BACKOFF_FACTOR, retryCount - 1);
      const jitter = Math.random() * 0.3 * baseDelay; // Add up to 30% jitter
      const delay = Math.floor(baseDelay + jitter);
      
      console.log(`Retrying ${operationName} in ${delay}ms (attempt ${retryCount}/${RETRY_CONFIG.MAX_RETRIES})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error(`Unknown error during ${operationName} execution`);
}

// Function to fetch MQLs from HubSpot
async function fetchMQLsFromHubspot(apiKey: string): Promise<MQLResult> {
  return await executeWithRetry(
    async () => {
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
    },
    "fetchMQLsFromHubspot"
  );
}

// Create standardized response helpers
function createSuccessResponse(data: any, message: string = 'Operation successful') {
  return new Response(
    JSON.stringify({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
}

function createErrorResponse(
  status: number,
  message: string,
  details?: any,
  executionTime?: number
) {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      details,
      execution_time: executionTime,
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
}

serve(async (req) => {
  const startTime = performance.now();
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("syncMQLs: Function started");
    
    // Parse and validate request body
    let requestData: SyncMQLsRequest;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error("syncMQLs: Invalid JSON payload:", error);
      return createErrorResponse(400, "Invalid JSON payload", String(error), (performance.now() - startTime) / 1000);
    }
    
    // Validate required fields
    const { tenant_id, hubspot_api_key: customApiKey } = requestData;
    
    if (!tenant_id) {
      console.error("syncMQLs: Missing tenant_id");
      return createErrorResponse(400, "tenant_id is required", undefined, (performance.now() - startTime) / 1000);
    }

    // Validate environment variables
    const envValidation = validateEnv(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
    if (!envValidation.valid) {
      return createErrorResponse(
        500, 
        "Missing required environment variables", 
        { missing: envValidation.missing },
        (performance.now() - startTime) / 1000
      );
    }

    // Get environment variables
    const supabaseUrl = getEnv('SUPABASE_URL', true);
    const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY', true);
    const defaultHubspotApiKey = getEnv('HUBSPOT_API_KEY');
    
    // Use custom API key if provided, otherwise fall back to the default
    const hubspotApiKey = customApiKey || defaultHubspotApiKey;
    
    if (!hubspotApiKey) {
      console.error("syncMQLs: No HubSpot API key available");
      return createErrorResponse(400, "HubSpot API key is required", undefined, (performance.now() - startTime) / 1000);
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
      
      // Insert KPIs with retry logic
      await executeWithRetry(
        async () => {
          const { error: kpiError } = await supabase
            .from('kpis')
            .upsert(kpis, { onConflict: 'tenant_id,name,date' });
          
          if (kpiError) {
            throw new Error(`Failed to save KPIs: ${kpiError.message}`);
          }
        },
        "kpisUpsert"
      );
      
      // Store sample lead data if leads table exists
      try {
        await executeWithRetry(
          async () => {
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
          },
          "leadsUpsert"
        );
      } catch (leadsError) {
        // Leads table might not exist, which is fine
        console.warn(`syncMQLs: Leads operation error: ${leadsError}`);
      }
      
      // Log system event
      await executeWithRetry(
        async () => {
          const { error: logError } = await supabase
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
            
          if (logError) {
            throw new Error(`Error logging system event: ${logError.message}`);
          }
        },
        "systemLogInsert"
      );
      
      // Return success response
      const executionTime = (performance.now() - startTime) / 1000;
      return createSuccessResponse({
        mql_count: mqlData.mql_count,
        previous_mql_count: prevMql?.value,
        high_quality_count: mqlData.high_quality_count,
        mql_to_sql_rate: mqlData.mql_to_sql_rate,
        kpi_count: kpis.length,
        leads_count: mqlData.recent_leads.length,
        execution_time: executionTime
      }, `HubSpot MQLs synced successfully`);
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
        (performance.now() - startTime) / 1000
      );
    }
  } catch (error: any) {
    console.error("syncMQLs: Unhandled error:", error);
    return createErrorResponse(
      500,
      "Unhandled error in syncMQLs function",
      error.message || String(error),
      (performance.now() - startTime) / 1000
    );
  }
});
