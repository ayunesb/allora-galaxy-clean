
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Import environment utilities
import { getEnv } from "../../lib/env.ts";
import { validateEnv, type EnvVar } from "../../lib/validateEnv.ts";
import {
  updateKPIsSchema,
  formatErrorResponse,
  formatSuccessResponse,
  safeParseRequest
} from "../../lib/validation.ts";

const MODULE_NAME = "updateKPIs";

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

// Main handler function to update KPIs
serve(async (req) => {
  const startTime = performance.now();
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log(`${MODULE_NAME}: Processing request`);

    // Check if Supabase environment variables are set correctly
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error(`${MODULE_NAME}: Missing Supabase configuration`);
      return formatErrorResponse(
        500, 
        "Supabase client could not be initialized", 
        "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured",
        (performance.now() - startTime) / 1000
      );
    }
    
    // Parse and validate request using zod schema
    const [payload, parseError] = await safeParseRequest(req, updateKPIsSchema);
    
    if (parseError) {
      console.error(`${MODULE_NAME}: Invalid payload - ${parseError}`);
      return formatErrorResponse(400, parseError, undefined, (performance.now() - startTime) / 1000);
    }
    
    const { tenant_id, sources = ["stripe", "ga4", "hubspot"], run_mode = "cron" } = payload || {};
    
    if (!tenant_id) {
      console.error(`${MODULE_NAME}: Missing tenant_id`);
      return formatErrorResponse(400, "tenant_id is required", undefined, (performance.now() - startTime) / 1000);
    }
    
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Results object to track KPI updates
    const results = {
      stripe: { success: false, message: "Not processed", kpis: [] },
      ga4: { success: false, message: "Not processed", kpis: [] },
      hubspot: { success: false, message: "Not processed", kpis: [] }
    };
    
    // Update Stripe KPIs if requested
    if (sources.includes("stripe") && env.STRIPE_API_KEY) {
      try {
        console.log(`${MODULE_NAME}: Updating Stripe KPIs for tenant ${tenant_id}`);
        
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
        
        try {
          // Get previous MRR value
          const { data: previousKpi, error: previousKpiError } = await supabase
            .from('kpis')
            .select('value')
            .eq('tenant_id', tenant_id)
            .eq('name', 'mrr')
            .eq('source', 'stripe')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (previousKpiError) {
            console.warn(`${MODULE_NAME}: Error fetching previous MRR KPI:`, previousKpiError);
          }
          
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
          
          console.log(`${MODULE_NAME}: Successfully updated MRR KPI for tenant ${tenant_id}`);
          
          results.stripe = { 
            success: true, 
            message: "Successfully updated Stripe KPIs", 
            kpis: [{ name: 'mrr', value: mrr, previous: previousMrr }] 
          };
        } catch (dbError) {
          console.error(`${MODULE_NAME}: Database error while updating Stripe KPIs:`, dbError);
          results.stripe = { 
            success: false, 
            message: `Database error while updating Stripe KPIs: ${dbError.message}`, 
            kpis: [] 
          };
        }
      } catch (error) {
        console.error(`${MODULE_NAME}: Error updating Stripe KPIs:`, error);
        results.stripe = { 
          success: false, 
          message: `Failed to update Stripe KPIs: ${error.message}`, 
          kpis: [] 
        };
      }
    } else if (sources.includes("stripe")) {
      console.log(`${MODULE_NAME}: Skipping Stripe KPIs - STRIPE_API_KEY not configured`);
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
          console.log(`${MODULE_NAME}: Updating GA4 KPIs for tenant ${tenant_id}`);
          
          // For now, set a placeholder for GA4 implementation
          results.ga4 = { 
            success: false, 
            message: "GA4 integration not yet implemented", 
            kpis: [] 
          };
          
        } catch (error) {
          console.error(`${MODULE_NAME}: Error updating GA4 KPIs:`, error);
          results.ga4 = { 
            success: false, 
            message: `Failed to update GA4 KPIs: ${error.message}`, 
            kpis: [] 
          };
        }
      } else {
        console.log(`${MODULE_NAME}: Skipping GA4 KPIs - GA4_API_KEY or GA4_PROPERTY_ID not configured`);
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
          console.log(`${MODULE_NAME}: Updating HubSpot KPIs for tenant ${tenant_id}`);
          
          // We could call our syncMQLs edge function here instead of duplicating code
          results.hubspot = { 
            success: false, 
            message: "HubSpot integration should use syncMQLs edge function", 
            kpis: [] 
          };
          
        } catch (error) {
          console.error(`${MODULE_NAME}: Error updating HubSpot KPIs:`, error);
          results.hubspot = { 
            success: false, 
            message: `Failed to update HubSpot KPIs: ${error.message}`, 
            kpis: [] 
          };
        }
      } else {
        console.log(`${MODULE_NAME}: Skipping HubSpot KPIs - HUBSPOT_API_KEY not configured`);
        results.hubspot = { 
          success: false, 
          message: "HUBSPOT_API_KEY is not configured", 
          kpis: [] 
        };
      }
    }
    
    try {
      // Log system event
      await supabase
        .from('system_logs')
        .insert({
          tenant_id: tenant_id,
          module: 'kpi',
          event: 'update_kpis',
          context: { results, run_mode }
        });
    } catch (logError) {
      console.warn(`${MODULE_NAME}: Error logging to system_logs:`, logError);
    }
    
    console.log(`${MODULE_NAME}: KPI updates completed for tenant ${tenant_id}`);
    
    // Return response with results
    return formatSuccessResponse({
      results,
      run_mode
    }, (performance.now() - startTime) / 1000);
    
  } catch (error) {
    console.error(`${MODULE_NAME}: Unhandled error:`, error);
    return formatErrorResponse(500, "Failed to update KPIs", String(error), (performance.now() - startTime) / 1000);
  }
});
