// Deno edge function to sync Marketing Qualified Leads from HubSpot
// Entry point for the syncMQLs edge function

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
  { name: 'HUBSPOT_API_KEY', required: false, description: 'HubSpot API key' }
];

// Validate environment variables
const env = validateEnv(requiredEnv);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { tenant_id } = await req.json();
    
    if (!tenant_id) {
      return formatErrorResponse(400, "tenant_id is required");
    }

    // Check if HubSpot API key is available
    const hubspotApiKey = env.HUBSPOT_API_KEY;
    if (!hubspotApiKey) {
      return formatErrorResponse(500, "HUBSPOT_API_KEY is not configured");
    }

    try {
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
        console.error("HubSpot API error:", errorDetail);
        return formatErrorResponse(hubspotResponse.status, "Failed to fetch MQLs from HubSpot", errorDetail);
      }

      const mqlData = await hubspotResponse.json();
      
      // Create Supabase client
      if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
        return formatErrorResponse(500, "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured");
      }
      
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
      
      // Create a KPI record for the number of MQLs
      const mqlCount = mqlData.results?.length || 0;
      
      // Get previous MQL count
      const { data: previousKpi } = await supabase
        .from('kpis')
        .select('value')
        .eq('tenant_id', tenant_id)
        .eq('name', 'mql_count')
        .eq('source', 'hubspot')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
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
        console.error("Error saving MQL count KPI:", kpiError);
        return formatErrorResponse(500, "Failed to save MQL count KPI", String(kpiError));
      }
      
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
      
      // Return success response
      return new Response(JSON.stringify({
        success: true,
        data: {
          mql_count: mqlCount,
          previous_mql_count: previousMqlCount,
          kpi_id: newKpi?.id
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
      
    } catch (error) {
      console.error("Error processing HubSpot data:", error);
      return formatErrorResponse(500, "Failed to process HubSpot data", String(error));
    }
    
  } catch (error) {
    console.error("Error syncing MQLs:", error);
    return formatErrorResponse(500, "Failed to sync MQLs", String(error));
  }
});
