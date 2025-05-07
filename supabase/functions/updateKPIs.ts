
// Deno edge function to update KPIs from various sources
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
function formatErrorResponse(status: number, message: string, details?: string) {
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
      timestamp: new Date().toISOString()
    }),
    { 
      status,
      headers
    }
  );
}

// Cors headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define required environment variables
const requiredEnv: EnvVar[] = [
  { name: 'SUPABASE_URL', required: true, description: 'Supabase project URL' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: true, description: 'Service role key for admin access' },
  { name: 'STRIPE_API_KEY', required: false, description: 'Stripe API key for subscription data' },
  { name: 'GA4_API_KEY', required: false, description: 'Google Analytics 4 API key' },
  { name: 'GA4_PROPERTY_ID', required: false, description: 'Google Analytics 4 property ID' },
  { name: 'HUBSPOT_API_KEY', required: false, description: 'HubSpot API key for marketing data' }
];

// Validate environment variables at startup
const env = validateEnv(requiredEnv);

// Input schema validation using Zod
const updateKpisSchema = z.object({
  tenant_id: z.string().uuid(),
  run_mode: z.enum(['manual', 'cron']).optional().default('manual'),
  sources: z.array(z.enum(['stripe', 'ga4', 'hubspot'])).optional().default(['stripe', 'ga4', 'hubspot'])
});

// Main handler function to update KPIs
serve(async (req) => {
  const startTime = performance.now();
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log('updateKPIs: Processing request');
    
    // Parse and validate request body
    let payload;
    try {
      const body = await req.json();
      const result = updateKpisSchema.safeParse(body);
      
      if (!result.success) {
        const errorMessage = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
        return formatErrorResponse(400, `Invalid request payload: ${errorMessage}`);
      }
      
      payload = result.data;
    } catch (parseError) {
      return formatErrorResponse(400, "Failed to parse request body", String(parseError));
    }
    
    const { tenant_id, run_mode, sources } = payload;
    
    // Create Supabase client
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return formatErrorResponse(500, "Supabase credentials not configured");
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
        return formatErrorResponse(404, `Tenant with ID ${tenant_id} not found`);
      }
      
      console.log(`updateKPIs: Processing KPI updates for tenant ${tenant.name}`);
    } catch (tenantError) {
      console.error("Error verifying tenant:", tenantError);
      return formatErrorResponse(500, "Failed to verify tenant", String(tenantError));
    }
    
    // Results object to track KPI updates
    const results = {
      stripe: { success: false, message: "Not processed", kpis: [] },
      ga4: { success: false, message: "Not processed", kpis: [] },
      hubspot: { success: false, message: "Not processed", kpis: [] }
    };
    
    // Update Stripe KPIs if requested
    if (sources.includes("stripe") && env.STRIPE_API_KEY) {
      try {
        // Fetch subscription data from Stripe
        const response = await fetch("https://api.stripe.com/v1/subscriptions?limit=100&status=active", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${env.STRIPE_API_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded"
          }
        });
        
        if (!response.ok) {
          const errorDetail = await response.text();
          throw new Error(`Stripe API error: ${errorDetail}`);
        }
        
        const stripeData = await response.json();
        
        // Calculate MRR from active subscriptions
        let mrr = 0;
        for (const subscription of stripeData.data || []) {
          if (subscription.status === 'active') {
            // Convert subscription amount from cents to dollars and divide by period (month)
            const amount = subscription.plan?.amount || 0;
            const interval = subscription.plan?.interval || 'month';
            const intervalCount = subscription.plan?.interval_count || 1;
            
            if (interval === 'month') {
              mrr += (amount / 100) / intervalCount;
            } else if (interval === 'year') {
              mrr += (amount / 100) / (12 * intervalCount);
            }
          }
        }
        
        // Get previous MRR value
        const { data: previousKpi } = await supabase
          .from('kpis')
          .select('value')
          .eq('tenant_id', tenant_id)
          .eq('name', 'mrr')
          .eq('source', 'stripe')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        const previousMrr = previousKpi?.value || 0;
        
        // Insert new MRR as KPI
        const { data: newKpi, error: kpiError } = await supabase
          .from('kpis')
          .insert({
            tenant_id: tenant_id,
            name: 'mrr',
            value: mrr,
            previous_value: previousMrr,
            source: 'stripe',
            category: 'financial',
            date: new Date().toISOString().split('T')[0]
          })
          .select()
          .single();
        
        if (kpiError) {
          throw new Error(`Failed to save MRR KPI: ${kpiError.message}`);
        }
        
        results.stripe = { 
          success: true, 
          message: "Successfully updated Stripe KPIs", 
          kpis: [{ name: 'mrr', value: mrr, previous: previousMrr }] 
        };
        
        console.log(`updateKPIs: Successfully updated MRR KPI to ${mrr}`);
        
      } catch (error: any) {
        results.stripe = { 
          success: false, 
          message: `Failed to update Stripe KPIs: ${error.message}`, 
          kpis: [] 
        };
        console.error("Error updating Stripe KPIs:", error);
      }
    } else if (sources.includes("stripe")) {
      results.stripe = { 
        success: false, 
        message: "STRIPE_API_KEY is not configured", 
        kpis: [] 
      };
    }
    
    // Update GA4 KPIs if requested
    if (sources.includes("ga4")) {
      const GA4_API_KEY = getEnv("GA4_API_KEY");
      const GA4_PROPERTY_ID = getEnv("GA4_PROPERTY_ID");
      
      if (GA4_API_KEY && GA4_PROPERTY_ID) {
        try {
          // For now, set a placeholder for GA4 implementation
          results.ga4 = { 
            success: false, 
            message: "GA4 integration not yet implemented", 
            kpis: [] 
          };
        } catch (error: any) {
          results.ga4 = { 
            success: false, 
            message: `Failed to update GA4 KPIs: ${error.message}`, 
            kpis: [] 
          };
          console.error("Error updating GA4 KPIs:", error);
        }
      } else {
        results.ga4 = { 
          success: false, 
          message: "GA4_API_KEY or GA4_PROPERTY_ID is not configured", 
          kpis: [] 
        };
      }
    }
    
    // Update HubSpot KPIs if requested
    if (sources.includes("hubspot")) {
      const HUBSPOT_API_KEY = getEnv("HUBSPOT_API_KEY");
      
      if (HUBSPOT_API_KEY) {
        try {
          // Call the syncMQLs edge function instead of duplicating code
          const { data: syncResult, error: syncError } = await supabase.functions.invoke('syncMQLs', {
            body: { tenant_id }
          });
          
          if (syncError) {
            throw new Error(`Failed to sync HubSpot MQLs: ${syncError.message}`);
          }
          
          results.hubspot = { 
            success: true, 
            message: "Successfully updated HubSpot KPIs via syncMQLs function", 
            kpis: syncResult?.data ? [syncResult.data] : [] 
          };
          
        } catch (error: any) {
          results.hubspot = { 
            success: false, 
            message: `Failed to update HubSpot KPIs: ${error.message}`, 
            kpis: [] 
          };
          console.error("Error updating HubSpot KPIs:", error);
        }
      } else {
        results.hubspot = { 
          success: false, 
          message: "HUBSPOT_API_KEY is not configured", 
          kpis: [] 
        };
      }
    }
    
    // Log system event
    try {
      await supabase
        .from('system_logs')
        .insert({
          tenant_id: tenant_id,
          module: 'kpi',
          event: 'update_kpis',
          context: { 
            results,
            run_mode,
            execution_time: (performance.now() - startTime) / 1000
          }
        });
    } catch (logError) {
      console.warn("Failed to log KPI update event:", logError);
    }
    
    // Return response with results
    return new Response(JSON.stringify({
      success: true,
      data: results,
      execution_time: (performance.now() - startTime) / 1000
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
    
  } catch (error: any) {
    console.error("Error updating KPIs:", error);
    
    // Try to log the error
    if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
        await supabase
          .from('system_logs')
          .insert({
            tenant_id: 'system',
            module: 'kpi',
            event: 'update_kpis_error',
            context: { error: String(error) }
          });
      } catch (logError) {
        console.error("Error logging KPI update failure:", logError);
      }
    }
    
    return formatErrorResponse(500, "Failed to update KPIs", String(error));
  }
});
