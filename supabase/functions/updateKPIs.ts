// Deno edge function to update KPIs from various sources
// Entry point for the updateKPIs edge function

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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse request body
    const { tenant_id, sources = ["stripe", "ga4", "hubspot"] } = await req.json();
    
    if (!tenant_id) {
      return formatErrorResponse(400, "tenant_id is required");
    }
    
    // Create Supabase client
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return formatErrorResponse(500, "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured");
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
          .single();
        
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
        
      } catch (error) {
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
        } catch (error) {
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
          // We could call our syncMQLs edge function here instead of duplicating code
          // This is just a placeholder for demonstration
          results.hubspot = { 
            success: false, 
            message: "HubSpot integration should use syncMQLs edge function", 
            kpis: [] 
          };
        } catch (error) {
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
    await supabase
      .from('system_logs')
      .insert({
        tenant_id: tenant_id,
        module: 'kpi',
        event: 'update_kpis',
        context: { results }
      });
    
    // Return response with results
    return new Response(JSON.stringify({
      success: true,
      data: results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("Error updating KPIs:", error);
    return formatErrorResponse(500, "Failed to update KPIs", String(error));
  }
});
