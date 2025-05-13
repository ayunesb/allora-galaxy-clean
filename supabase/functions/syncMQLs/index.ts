
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCorsRequest,
  createErrorResponse,
  createSuccessResponse,
  safeGetEnv,
  logSystemEvent,
  generateRequestId
} from "../_shared/edgeUtils/index.ts";

import { validateSyncMQLsRequest } from "./validation.ts";
import { fetchMQLsFromHubspot, getHubspotApiKey } from "./hubspotAdapter.ts";
import { processMQLKPIs } from "./kpiManager.ts";

serve(async (req) => {
  const startTime = performance.now();
  const requestId = generateRequestId();
  
  // Handle CORS preflight requests
  const corsResponse = handleCorsRequest(req);
  if (corsResponse) {
    return corsResponse;
  }

  try {
    console.log("syncMQLs: Function started");
    
    // Parse and validate request
    const [input, validationError] = await validateSyncMQLsRequest(req);
    
    if (validationError) {
      console.error("syncMQLs: Invalid payload -", validationError);
      return createErrorResponse(validationError, undefined, 400, requestId);
    }
    
    if (!input || !input.tenant_id) {
      console.error("syncMQLs: Missing tenant_id");
      return createErrorResponse("tenant_id is required", undefined, 400, requestId);
    }

    // Get HubSpot API key
    let hubspotApiKey: string;
    try {
      hubspotApiKey = getHubspotApiKey(input.hubspot_api_key);
    } catch (apiKeyError) {
      console.error("syncMQLs: API key error -", apiKeyError.message);
      return createErrorResponse(apiKeyError.message, undefined, 400, requestId);
    }

    // Initialize Supabase client
    const supabaseUrl = safeGetEnv('SUPABASE_URL');
    const supabaseServiceKey = safeGetEnv('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("syncMQLs: Missing Supabase credentials");
      return createErrorResponse("Supabase credentials not configured", undefined, 500, requestId);
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify tenant exists
    try {
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('id, name')
        .eq('id', input.tenant_id)
        .maybeSingle();
        
      if (tenantError) {
        throw new Error(`Failed to verify tenant: ${tenantError.message}`);
      }
      
      if (!tenant) {
        return createErrorResponse(
          `Tenant with ID ${input.tenant_id} not found`, 
          undefined, 
          404, 
          requestId
        );
      }
      
      console.log(`syncMQLs: Syncing MQLs for tenant ${tenant.name}`);
    } catch (tenantError) {
      console.error("syncMQLs: Error verifying tenant:", tenantError);
      return createErrorResponse(
        "Failed to verify tenant", 
        String(tenantError), 
        500, 
        requestId
      );
    }

    try {
      // Fetch MQL data from HubSpot
      console.log(`syncMQLs: Fetching HubSpot data for tenant ${input.tenant_id}`);
      const mqlData = await fetchMQLsFromHubspot(hubspotApiKey);
      console.log(`syncMQLs: Found ${mqlData.mql_count} MQLs for tenant ${input.tenant_id}`);
      
      // Process and store KPI data
      const kpiResults = await processMQLKPIs(supabase, input.tenant_id, mqlData);
      
      // Log system event
      await logSystemEvent(
        supabase,
        'marketing',
        'mql_sync_complete',
        {
          mql_count: mqlData.mql_count,
          high_quality_count: mqlData.high_quality_count,
          conversion_rate: mqlData.mql_to_sql_rate,
          execution_time: (performance.now() - startTime) / 1000
        },
        input.tenant_id
      );
      
      // Return success response
      return createSuccessResponse({
        message: "HubSpot MQLs synced successfully",
        ...kpiResults,
        execution_time: (performance.now() - startTime) / 1000
      }, 200, requestId);
      
    } catch (error: any) {
      console.error(`syncMQLs: Error processing tenant ${input.tenant_id}:`, error);
      
      // Log error to system logs
      try {
        await logSystemEvent(
          supabase,
          'marketing',
          'mql_sync_failed',
          { 
            error: error.message || String(error),
            execution_time: (performance.now() - startTime) / 1000
          },
          input.tenant_id
        );
      } catch (logError) {
        console.error("syncMQLs: Failed to log error:", logError);
      }
      
      return createErrorResponse(
        "Failed to sync MQLs from HubSpot",
        error.message || String(error),
        500,
        requestId
      );
    }
  } catch (error: any) {
    console.error("syncMQLs: Unhandled error:", error);
    return createErrorResponse(
      "Unhandled error in syncMQLs function",
      error.message || String(error),
      500,
      requestId
    );
  }
});
