
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getEnvVar, corsHeaders, validateEnv, logEnvStatus, formatErrorResponse } from "../../../src/lib/edge/envManager.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    name: 'STRIPE_SECRET_KEY',
    required: false,
    description: 'Stripe API key for fetching subscription data'
  },
  { 
    name: 'GA4_API_KEY',
    required: false,
    description: 'Google Analytics 4 API key for fetching analytics data'
  },
  { 
    name: 'HUBSPOT_API_KEY',
    required: false,
    description: 'HubSpot API key for fetching marketing data'
  }
];

// Validate all required environment variables at startup
const env = validateEnv(requiredEnv);

// Log environment status on startup (redacted)
logEnvStatus(env);

type KpiCategory = 'financial' | 'marketing' | 'sales' | 'product';
type KpiSource = 'stripe' | 'ga4' | 'hubspot' | 'manual';

interface KpiData {
  tenant_id: string;
  name: string;
  value: number;
  previous_value?: number | null;
  source: KpiSource;
  category: KpiCategory;
  date: string;
}

// Create Supabase client outside the handler
const supabaseAdmin = env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  // Check if Supabase client was initialized properly
  if (!supabaseAdmin) {
    return formatErrorResponse(
      500, 
      "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured"
    );
  }

  try {
    // Parse request payload
    const { tenantId, sources } = await req.json();
    
    if (!tenantId) {
      return formatErrorResponse(400, "Missing required parameter: tenantId");
    }

    // Initialize results object
    const results = {
      success: true,
      updates: [] as string[],
      errors: [] as string[]
    };

    // Update KPIs from each requested source
    const updateSources = sources || ['stripe', 'ga4', 'hubspot'];
    
    // Process each data source in parallel with proper error handling
    const updatePromises = updateSources.map(source => 
      updateKpiSource(source, tenantId, env, supabaseAdmin)
        .then(message => results.updates.push(message))
        .catch(error => {
          console.error(`Error updating ${source} KPIs:`, error);
          results.errors.push(`${source}: ${error.message}`);
          return null; // Continue with other sources even if one fails
        })
    );
    
    await Promise.all(updatePromises);
    
    // Consider the overall operation successful if at least one source succeeded
    if (results.updates.length === 0 && results.errors.length > 0) {
      results.success = false;
    }

    // Log the update attempt regardless of outcome
    try {
      await supabaseAdmin
        .from('system_logs')
        .insert({
          tenant_id: tenantId,
          module: 'kpi',
          event: 'kpi_update_attempt',
          context: { 
            sources: updateSources,
            success: results.success,
            errors: results.errors.length > 0 ? results.errors : null
          }
        });
    } catch (logError) {
      console.error("Error logging KPI update attempt:", logError);
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in updateKPIs function:", error);
    
    return formatErrorResponse(500, error.message || "Unknown error occurred");
  }
});

// Function to update KPIs from a specific source
async function updateKpiSource(
  source: string, 
  tenantId: string, 
  env: Record<string, string>,
  supabase: any
): Promise<string> {
  // Switch based on source type
  switch (source) {
    case 'stripe':
      // Check if Stripe API key is available
      if (!env.STRIPE_SECRET_KEY) {
        return "Stripe KPIs skipped: API key not configured";
      }
      try {
        // Fetch subscription data from Stripe
        // Placeholder: Replace with actual Stripe API call
        const stripeData = await fetchStripeData(env.STRIPE_SECRET_KEY);
        
        // Update financial KPIs based on Stripe data
        // Placeholder: Replace with actual database update logic
        await updateFinancialKpis(tenantId, stripeData, supabase);
        
        return "Stripe KPIs updated successfully";
      } catch (error: any) {
        console.error("Error updating Stripe KPIs:", error);
        throw new Error("Failed to update Stripe KPIs: " + error.message);
      }
      
    case 'ga4':
      // Check if GA4 API key is available
      if (!env.GA4_API_KEY) {
        return "GA4 KPIs skipped: API key not configured";
      }
      try {
        // Fetch analytics data from GA4
        // Placeholder: Replace with actual GA4 API call
        const ga4Data = await fetchGA4Data(env.GA4_API_KEY);
        
        // Update marketing KPIs based on GA4 data
        // Placeholder: Replace with actual database update logic
        await updateMarketingKpis(tenantId, ga4Data, supabase);
        
        return "GA4 KPIs updated successfully";
      } catch (error: any) {
        console.error("Error updating GA4 KPIs:", error);
        throw new Error("Failed to update GA4 KPIs: " + error.message);
      }
      
    case 'hubspot':
      // Check if HubSpot API key is available
      if (!env.HUBSPOT_API_KEY) {
        return "HubSpot KPIs skipped: API key not configured";
      }
      try {
        // Fetch marketing data from HubSpot
        // Placeholder: Replace with actual HubSpot API call
        const hubspotData = await fetchHubspotData(env.HUBSPOT_API_KEY);
        
        // Update sales KPIs based on HubSpot data
        // Placeholder: Replace with actual database update logic
        await updateSalesKpis(tenantId, hubspotData, supabase);
        
        return "HubSpot KPIs updated successfully";
      } catch (error: any) {
        console.error("Error updating HubSpot KPIs:", error);
        throw new Error("Failed to update HubSpot KPIs: " + error.message);
      }
      
    default:
      throw new Error(`Unsupported KPI source: ${source}`);
  }
}

// Placeholder functions for fetching data from external sources
async function fetchStripeData(apiKey: string): Promise<any> {
  // Replace with actual Stripe API call
  console.log("Fetching Stripe data with API key:", apiKey);
  return { /* Stripe data */ };
}

async function fetchGA4Data(apiKey: string): Promise<any> {
  // Replace with actual GA4 API call
  console.log("Fetching GA4 data with API key:", apiKey);
  return { /* GA4 data */ };
}

async function fetchHubspotData(apiKey: string): Promise<any> {
  // Replace with actual HubSpot API call
  console.log("Fetching HubSpot data with API key:", apiKey);
  return { /* HubSpot data */ };
}

// Placeholder functions for updating KPIs in the database
async function updateFinancialKpis(tenantId: string, data: any, supabase: any): Promise<void> {
  // Mock MRR value
  const mockMRR = Math.floor(Math.random() * 2000) + 8000;
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Get previous MRR value
  const { data: previousKpi } = await supabase
    .from('kpis')
    .select('value')
    .eq('tenant_id', tenantId)
    .eq('name', 'Monthly Recurring Revenue')
    .eq('source', 'stripe')
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();
    
  // Create KPI entry
  const kpiData: KpiData = {
    tenant_id: tenantId,
    name: "Monthly Recurring Revenue",
    value: mockMRR,
    previous_value: previousKpi?.value || null,
    source: "stripe",
    category: "financial",
    date: currentDate,
  };
    
  // Insert new KPI entry
  await supabase
    .from("kpis")
    .upsert(kpiData, { 
      onConflict: "tenant_id,name,date",
      ignoreDuplicates: false
    });
}

async function updateMarketingKpis(tenantId: string, data: any, supabase: any): Promise<void> {
  // Mock metrics
  const mockWebsiteVisits = Math.floor(Math.random() * 5000) + 1000;
  const currentDate = new Date().toISOString().split('T')[0];
  
  await supabase
    .from("kpis")
    .upsert({
      tenant_id: tenantId,
      name: "Website Visitors",
      value: mockWebsiteVisits,
      source: "ga4",
      category: "marketing",
      date: currentDate,
    }, { 
      onConflict: "tenant_id,name,date",
      ignoreDuplicates: false
    });
}

async function updateSalesKpis(tenantId: string, data: any, supabase: any): Promise<void> {
  // Mock metrics
  const mockLeads = Math.floor(Math.random() * 200) + 50;
  const currentDate = new Date().toISOString().split('T')[0];
  
  await supabase
    .from("kpis")
    .upsert({
      tenant_id: tenantId,
      name: "Sales Leads",
      value: mockLeads,
      source: "hubspot",
      category: "sales",
      date: currentDate,
    }, { 
      onConflict: "tenant_id,name,date",
      ignoreDuplicates: false
    });
}
