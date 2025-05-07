
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

// Handle CORS preflight requests
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get HubSpot API key
  const HUBSPOT_API_KEY = getEnv("HUBSPOT_API_KEY");
  if (!HUBSPOT_API_KEY) {
    return new Response(JSON.stringify({ 
      error: "HUBSPOT_API_KEY is not configured" 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }

  try {
    // Parse request body
    const { tenant_id } = await req.json();
    if (!tenant_id) {
      return new Response(JSON.stringify({ 
        error: "tenant_id is required" 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Fetch MQLs from HubSpot API
    const hubspotResponse = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts?properties=hs_lead_status,email,firstname,lastname&filterGroups=[{\"filters\":[{\"propertyName\":\"hs_lead_status\",\"operator\":\"EQ\",\"value\":\"MQL\"}]}]", 
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${HUBSPOT_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (!hubspotResponse.ok) {
      const errorDetail = await hubspotResponse.text();
      console.error("HubSpot API error:", errorDetail);
      return new Response(JSON.stringify({ 
        error: "Failed to fetch MQLs from HubSpot", 
        details: errorDetail 
      }), { 
        status: hubspotResponse.status, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    const mqlData = await hubspotResponse.json();
    
    // Create a KPI record for the number of MQLs
    const mqlCount = mqlData.results?.length || 0;
    
    // Get Supabase admin URL, key and create a client
    const SUPABASE_URL = getEnv("SUPABASE_URL");
    const SUPABASE_SERVICE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return new Response(JSON.stringify({ 
        error: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured" 
      }), { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // Create Supabase client
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.31.0");
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
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
      return new Response(JSON.stringify({ 
        error: "Failed to save MQL count KPI", 
        details: kpiError 
      }), { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
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
    console.error("Error syncing MQLs:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to sync MQLs", 
      details: error.message 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
