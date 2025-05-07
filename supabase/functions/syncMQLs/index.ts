
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getEnv } from "../../src/lib/utils/env.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define environment variables needed for this function
const requiredEnv = [
  { 
    name: 'SUPABASE_URL', 
    required: true,
    description: 'Supabase project URL for database access'
  },
  { 
    name: 'SUPABASE_SERVICE_ROLE_KEY', 
    required: true,
    description: 'Service role key for admin database access'
  },
  { 
    name: 'HUBSPOT_API_KEY',
    required: false,
    description: 'HubSpot API key for fetching marketing data'
  }
];

// Validate all required environment variables at startup
function validateEnv(envVars) {
  const result = {};
  const missing = [];

  for (const envVar of envVars) {
    const value = getEnv(envVar.name);
    result[envVar.name] = value;

    if (envVar.required && !value) {
      missing.push(`${envVar.name} (${envVar.description})`);
    }
  }

  if (missing.length > 0) {
    console.warn(`⚠️ Missing required environment variables: ${missing.join(', ')}`);
  }

  return result;
}

// Log environment status on startup (redacted)
function logEnvStatus(env) {
  console.log(`Environment status: ${Object.keys(env).filter(k => env[k]).length}/${Object.keys(env).length} variables available`);
  for (const key of Object.keys(env)) {
    console.log(`${key}: ${env[key] ? '✅ Set' : '❌ Missing'}`);
  }
}

// Format error response
function formatErrorResponse(status, message, details = null) {
  const body = {
    error: message,
    details: details || null,
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Validate all required environment variables at startup
const env = validateEnv(requiredEnv);

// Log environment status on startup (redacted)
logEnvStatus(env);

type KpiCategory = 'financial' | 'marketing' | 'sales' | 'product';
type KpiSource = 'stripe' | 'ga4' | 'hubspot';

interface KpiData {
  name: string;
  value: number;
  previous_value?: number | null;
  source: KpiSource;
  category: KpiCategory;
  date: string;
  tenant_id: string;
}

// Create Supabase client outside the handler
const supabaseAdmin = env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if Supabase client was initialized properly
  if (!supabaseAdmin) {
    return formatErrorResponse(
      500, 
      "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured"
    );
  }

  try {
    // Parse request body for optional parameters
    let body;
    let specificTenantId;
    let hubspotApiKey;
    
    try {
      body = await req.json();
      specificTenantId = body.tenant_id;
      hubspotApiKey = body.hubspot_api_key;
    } catch {
      // Body parsing failed, assume it's a scheduled run for all tenants
    }
    
    // Get tenants to process
    const tenantsQuery = supabaseAdmin.from("tenants").select("id, name, metadata");
    
    // Filter by specific tenant if provided
    if (specificTenantId) {
      tenantsQuery.eq("id", specificTenantId);
    }
    
    const { data: tenants, error: tenantsError } = await tenantsQuery;
      
    if (tenantsError) {
      return formatErrorResponse(500, `Error fetching tenants: ${tenantsError.message}`);
    }
    
    if (!tenants || tenants.length === 0) {
      return new Response(
        JSON.stringify({ message: "No tenants found to process" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const results: Record<string, any> = {};
    
    // Process each tenant
    for (const tenant of tenants) {
      results[tenant.id] = { name: tenant.name, metrics: [] };
      
      // Get HubSpot API key from tenant metadata or use provided key or fallback
      const tenantHubspotApiKey = tenant.metadata?.hubspot_api_key || hubspotApiKey || env.HUBSPOT_API_KEY;
      
      if (!tenantHubspotApiKey) {
        console.warn(`No HubSpot API key available for tenant ${tenant.name}, skipping`);
        results[tenant.id].skipped = true;
        results[tenant.id].reason = "No HubSpot API key available";
        continue;
      }
      
      try {
        // In a real implementation, you would use HubSpot's API to get MQL data
        // Here we're just mocking the functionality
        
        // Mock MQL count
        const mockMQLCount = Math.floor(Math.random() * 300) + 100;
        
        // Get the previous KPI entry
        const { data: previousKpi } = await supabaseAdmin
          .from("kpis")
          .select("value")
          .eq("tenant_id", tenant.id)
          .eq("name", "Marketing Qualified Leads")
          .eq("source", "hubspot")
          .order("date", { ascending: false })
          .limit(1)
          .maybeSingle();
          
        const currentDate = new Date().toISOString().split('T')[0];
          
        // Create KPI entry with proper typing
        const kpiData: KpiData = {
          tenant_id: tenant.id,
          name: "Marketing Qualified Leads",
          value: mockMQLCount,
          previous_value: previousKpi?.value || null,
          source: "hubspot",
          category: "marketing",
          date: currentDate,
        };
        
        // Insert new KPI entry
        await supabaseAdmin
          .from("kpis")
          .upsert(kpiData, { 
            onConflict: "tenant_id,name,date",
            ignoreDuplicates: false
          });
          
        results[tenant.id].metrics.push({
          name: "Marketing Qualified Leads",
          value: mockMQLCount,
          previous_value: previousKpi?.value
        });
          
        console.log(`Updated MQL count for tenant ${tenant.name}: ${mockMQLCount}`);

        // Log system event for tracking
        await supabaseAdmin
          .from("system_logs")
          .insert({
            tenant_id: tenant.id,
            module: 'marketing',
            event: 'kpi_updated',
            context: { kpi_name: 'Marketing Qualified Leads', source: 'hubspot' }
          });
      } catch (error) {
        console.error(`Error updating MQL count for tenant ${tenant.name}:`, error);
        results[tenant.id].errors = results[tenant.id].errors || [];
        results[tenant.id].errors.push({
          metric: "mql",
          error: String(error)
        });
        
        // Log error to system logs for tracking
        try {
          await supabaseAdmin
            .from("system_logs")
            .insert({
              tenant_id: tenant.id,
              module: 'marketing',
              event: 'kpi_update_failed',
              context: { 
                kpi_name: 'Marketing Qualified Leads', 
                source: 'hubspot',
                error: String(error)
              }
            });
        } catch (logError) {
          console.error('Failed to log error', logError);
        }
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `MQLs updated for ${Object.values(results).filter(r => !r.skipped).length} tenant(s)`,
      skipped: Object.values(results).filter(r => r.skipped).length,
      results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in syncMQLs:", error);
    return formatErrorResponse(500, "Failed to sync MQLs", String(error));
  }
});
