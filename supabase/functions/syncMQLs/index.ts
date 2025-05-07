
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Import environment utilities
import { getEnv } from "../../lib/env.ts";
import { validateEnv, type EnvVar } from "../../lib/validateEnv.ts";
import {
  syncMQLsSchema,
  formatErrorResponse,
  formatSuccessResponse,
  safeParseRequest
} from "../../lib/validation.ts";

const MODULE_NAME = "syncMQLs";

// Cors headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define required environment variables
const requiredEnv: EnvVar[] = [
  { name: 'SUPABASE_URL', required: true, description: 'Supabase project URL' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: true, description: 'Service role key for admin access' },
  { name: 'HUBSPOT_API_KEY', required: false, description: 'HubSpot API key' }
];

// Validate environment variables
const env = validateEnv(requiredEnv);

serve(async (req) => {
  const startTime = performance.now();
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`${MODULE_NAME}: Processing request`);
    
    // Parse and validate request using zod schema
    const [payload, parseError] = await safeParseRequest(req, syncMQLsSchema);
    
    if (parseError) {
      console.error(`${MODULE_NAME}: Invalid payload - ${parseError}`);
      return formatErrorResponse(400, parseError, undefined, (performance.now() - startTime) / 1000);
    }
    
    const { tenant_id } = payload || {};
    
    if (!tenant_id) {
      console.error(`${MODULE_NAME}: Missing tenant_id`);
      return formatErrorResponse(400, "tenant_id is required", undefined, (performance.now() - startTime) / 1000);
    }

    // Check if HubSpot API key is available
    const hubspotApiKey = env.HUBSPOT_API_KEY;
    if (!hubspotApiKey) {
      console.error(`${MODULE_NAME}: Missing HubSpot API key`);
      return formatErrorResponse(500, "HUBSPOT_API_KEY is not configured", undefined, (performance.now() - startTime) / 1000);
    }

    // Create Supabase client
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error(`${MODULE_NAME}: Missing Supabase configuration`);
      return formatErrorResponse(
        500, 
        "Supabase client could not be initialized", 
        "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured",
        (performance.now() - startTime) / 1000
      );
    }
    
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    try {
      console.log(`${MODULE_NAME}: Fetching MQLs from HubSpot for tenant ${tenant_id}`);
      
      // Fetch MQLs from HubSpot API
      const hubspotResponse = await fetch(
        "https://api.hubapi.com/crm/v3/objects/contacts?properties=hs_lead_status,email,firstname,lastname&filterGroups=[{\"filters\":[{\"propertyName\":\"hs_lead_status\",\"operator\":\"EQ\",\"value\":\"MQL\"}]}]", 
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${hubspotApiKey}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!hubspotResponse.ok) {
        const errorDetail = await hubspotResponse.text();
        console.error(`${MODULE_NAME}: HubSpot API error:`, errorDetail);
        return formatErrorResponse(
          hubspotResponse.status, 
          "Failed to fetch MQLs from HubSpot", 
          errorDetail,
          (performance.now() - startTime) / 1000
        );
      }

      const mqlData = await hubspotResponse.json();
      
      // Get number of MQLs
      const mqlCount = mqlData.results?.length || 0;
      
      console.log(`${MODULE_NAME}: Found ${mqlCount} MQLs for tenant ${tenant_id}`);
      
      try {
        // Get previous MQL count
        const { data: previousKpi, error: previousKpiError } = await supabase
          .from('kpis')
          .select('value')
          .eq('tenant_id', tenant_id)
          .eq('name', 'mql_count')
          .eq('source', 'hubspot')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (previousKpiError) {
          console.warn(`${MODULE_NAME}: Error fetching previous KPI:`, previousKpiError);
        }
        
        const previousMqlCount = previousKpi?.value || 0;
        
        // Insert new MQL count as KPI
        const { data: newKpi, error: kpiError } = await supabase
          .from('kpis')
          .insert({
            tenant_id: tenant_id,
            name: 'mql_count',
            value: mqlCount,
            previous_value: previousMqlCount,
            source: 'hubspot',
            category: 'marketing',
            date: new Date().toISOString().split('T')[0]
          })
          .select()
          .single();
        
        if (kpiError) {
          console.error(`${MODULE_NAME}: Error saving MQL count KPI:`, kpiError);
          return formatErrorResponse(
            500, 
            "Failed to save MQL count KPI", 
            kpiError.message,
            (performance.now() - startTime) / 1000
          );
        }
        
        try {
          // Log system event
          await supabase
            .from('system_logs')
            .insert({
              tenant_id: tenant_id,
              module: 'kpi',
              event: 'sync_hubspot_mqls',
              context: { 
                mql_count: mqlCount,
                previous_mql_count: previousMqlCount,
                change_percentage: previousMqlCount ? ((mqlCount - previousMqlCount) / previousMqlCount) * 100 : 0
              }
            });
        } catch (logError) {
          console.warn(`${MODULE_NAME}: Error logging to system_logs:`, logError);
        }
        
        console.log(`${MODULE_NAME}: Successfully updated MQL count for tenant ${tenant_id}`);
        
        // Return success response
        return formatSuccessResponse({
          mql_count: mqlCount,
          previous_mql_count: previousMqlCount,
          kpi_id: newKpi?.id
        }, (performance.now() - startTime) / 1000);
      } catch (dbError) {
        console.error(`${MODULE_NAME}: Database error:`, dbError);
        return formatErrorResponse(
          500, 
          "Failed to process MQL data", 
          String(dbError),
          (performance.now() - startTime) / 1000
        );
      }
    } catch (hubspotError) {
      console.error(`${MODULE_NAME}: Error processing HubSpot request:`, hubspotError);
      return formatErrorResponse(
        500, 
        "Failed to process HubSpot data", 
        String(hubspotError),
        (performance.now() - startTime) / 1000
      );
    }
  } catch (error) {
    console.error(`${MODULE_NAME}: Unhandled error:`, error);
    return formatErrorResponse(
      500,
      "Failed to sync MQLs", 
      String(error),
      (performance.now() - startTime) / 1000
    );
  }
});
