
// Deno edge function to sync Marketing Qualified Leads from HubSpot
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Helper function to safely get environment variables with fallbacks
function getEnv(name: string, fallback: string = ""): string {
  try {
    return typeof Deno !== "undefined" && typeof Deno.env !== "undefined" && Deno.env 
      ? Deno.env.get(name) ?? fallback
      : process.env[name] || fallback;
  } catch (err) {
    console.error(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

// Define environment variable structure
type EnvVar = {
  name: string;
  required: boolean;
  description: string;
};

// Validate environment variables
function validateEnv(requiredEnvs: EnvVar[]): Record<string, string> {
  const result: Record<string, string> = {};
  const missing: string[] = [];
  
  for (const env of requiredEnvs) {
    const value = getEnv(env.name);
    result[env.name] = value;
    
    if (env.required && !value) {
      missing.push(env.name);
    }
  }
  
  if (missing.length > 0) {
    console.warn(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  return result;
}

// Format error response
function formatErrorResponse(status: number, message: string, details?: string, executionTime?: number) {
  const headers = {
    "Access-Control-Allow-Origin": "*", 
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json"
  };
  
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      details: details || undefined,
      execution_time: executionTime,
      timestamp: new Date().toISOString()
    }),
    { 
      status,
      headers
    }
  );
}

// Format success response
function formatSuccessResponse(data: any, executionTime?: number) {
  const headers = {
    "Access-Control-Allow-Origin": "*", 
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json"
  };
  
  return new Response(
    JSON.stringify({
      success: true,
      data,
      execution_time: executionTime,
      timestamp: new Date().toISOString()
    }),
    { 
      status: 200,
      headers
    }
  );
}

// Parse and validate request
async function safeParseRequest(req: Request, schema: z.ZodSchema) {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    if (result.success) {
      return [result.data, null];
    } else {
      const errorMessage = result.error.issues
        .map(i => `${i.path.join('.')}: ${i.message}`)
        .join(', ');
      return [null, errorMessage];
    }
  } catch (error) {
    return [null, "Invalid JSON in request body"];
  }
}

// Cors headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define input schema
const syncMQLsSchema = z.object({
  tenant_id: z.string().uuid(),
  hubspot_api_key: z.string().optional(),
});

// Define required environment variables
const requiredEnv: EnvVar[] = [
  { name: 'SUPABASE_URL', required: true, description: 'Supabase project URL' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: true, description: 'Service role key for admin access' },
  { name: 'HUBSPOT_API_KEY', required: false, description: 'HubSpot API key' }
];

// Validate environment variables
const env = validateEnv(requiredEnv);

const MODULE_NAME = "syncMQLs";

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
    
    const { tenant_id, hubspot_api_key } = payload || {};
    
    if (!tenant_id) {
      console.error(`${MODULE_NAME}: Missing tenant_id`);
      return formatErrorResponse(400, "tenant_id is required", undefined, (performance.now() - startTime) / 1000);
    }

    // Check if HubSpot API key is available - prefer one from request, fallback to env
    const hubspotApiKey = hubspot_api_key || env.HUBSPOT_API_KEY;
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

    // Verify tenant exists
    try {
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('id, name')
        .eq('id', tenant_id)
        .maybeSingle();
        
      if (tenantError) {
        throw new Error(`Failed to verify tenant: ${tenantError.message}`);
      }
      
      if (!tenant) {
        return formatErrorResponse(404, `Tenant with ID ${tenant_id} not found`, undefined, (performance.now() - startTime) / 1000);
      }
      
      console.log(`${MODULE_NAME}: Syncing MQLs for tenant ${tenant.name}`);
    } catch (tenantError) {
      console.error(`${MODULE_NAME}: Error verifying tenant:`, tenantError);
      return formatErrorResponse(500, "Failed to verify tenant", String(tenantError), (performance.now() - startTime) / 1000);
    }

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
                change_percentage: previousMqlCount ? ((mqlCount - previousMqlCount) / previousMqlCount) * 100 : 0,
                execution_time: (performance.now() - startTime) / 1000
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
    
    // Try to log the error
    try {
      if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
        await supabase
          .from('system_logs')
          .insert({
            tenant_id: 'system',
            module: 'marketing',
            event: 'sync_mqls_error',
            context: { error: String(error) }
          });
      }
    } catch (logError) {
      console.error(`${MODULE_NAME}: Failed to log error to system_logs:`, logError);
    }
    
    return formatErrorResponse(
      500,
      "Failed to sync MQLs", 
      String(error),
      (performance.now() - startTime) / 1000
    );
  }
});
