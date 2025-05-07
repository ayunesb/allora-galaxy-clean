
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HubspotContact {
  id: string;
  properties: {
    firstname?: string;
    lastname?: string;
    email?: string;
    hs_lead_status?: string;
    createdate?: string;
    hubspot_score?: string;
    lifecyclestage?: string;
    [key: string]: any; // For other properties
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { tenant_id, auth_token } = await req.json();

    if (!tenant_id) {
      return new Response(
        JSON.stringify({ error: "Tenant ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (!auth_token) {
      return new Response(
        JSON.stringify({ error: "HubSpot auth token is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create Supabase client with service role for admin access
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        global: { headers: { Authorization: req.headers.get("Authorization")! } },
      }
    );
    
    // Get existing KPIs for the tenant to avoid duplicates
    const { data: existingKPIs, error: kpiError } = await supabaseAdmin
      .from("kpis")
      .select("*")
      .eq("tenant_id", tenant_id)
      .eq("source", "hubspot")
      .eq("category", "marketing");

    if (kpiError) {
      console.error("Error fetching existing KPIs:", kpiError);
      return new Response(
        JSON.stringify({ error: "Failed to check existing KPIs", details: kpiError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Fetch MQLs from HubSpot
    const hubSpotResponse = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts/search",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${auth_token}`
        },
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: "lifecyclestage",
                  operator: "EQ",
                  value: "marketingqualifiedlead"
                }
              ]
            }
          ],
          properties: [
            "email", 
            "firstname", 
            "lastname", 
            "hubspot_score", 
            "createdate", 
            "hs_lead_status", 
            "lifecyclestage"
          ],
          limit: 100
        })
      }
    );

    if (!hubSpotResponse.ok) {
      const errorData = await hubSpotResponse.text();
      console.error("HubSpot API error:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to fetch MQLs from HubSpot", details: errorData }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: hubSpotResponse.status }
      );
    }

    const { results, total } = await hubSpotResponse.json();
    
    if (!results || !Array.isArray(results)) {
      return new Response(
        JSON.stringify({ error: "Invalid response from HubSpot API", details: "No results array found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Process and save MQL data
    const today = new Date().toISOString().split('T')[0];
    const newMqlCount = results.length;
    
    // Check if we already have a KPI entry for today
    const existingKpiForToday = existingKPIs?.find(kpi => 
      kpi.name === "mql_count" && kpi.date.startsWith(today)
    );

    let kpiResult;
    
    // Get the previous MQL count for trend calculation
    const previousMqlCount = existingKPIs
      ?.filter(kpi => kpi.name === "mql_count" && kpi.date < today)
      ?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.value || 0;

    if (existingKpiForToday) {
      // Update existing KPI
      const { data, error } = await supabaseAdmin
        .from("kpis")
        .update({
          value: newMqlCount,
          previous_value: previousMqlCount,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingKpiForToday.id)
        .select();
      
      if (error) {
        throw new Error(`Failed to update KPI: ${error.message}`);
      }
      kpiResult = data;
    } else {
      // Insert new KPI
      const { data, error } = await supabaseAdmin
        .from("kpis")
        .insert({
          tenant_id,
          name: "mql_count",
          value: newMqlCount,
          previous_value: previousMqlCount,
          source: "hubspot",
          category: "marketing",
          date: today
        })
        .select();
      
      if (error) {
        throw new Error(`Failed to insert KPI: ${error.message}`);
      }
      kpiResult = data;
    }

    // Create additional KPIs for MQL metrics
    const highScoreMqls = results.filter((contact: HubspotContact) => 
      parseInt(contact.properties.hubspot_score || "0", 10) >= 70
    ).length;

    const recentMqls = results.filter((contact: HubspotContact) => {
      if (!contact.properties.createdate) return false;
      const createDate = new Date(contact.properties.createdate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createDate >= thirtyDaysAgo;
    }).length;

    // Save additional metrics
    await Promise.all([
      // High-score MQLs
      supabaseAdmin
        .from("kpis")
        .upsert({
          tenant_id,
          name: "high_score_mqls",
          value: highScoreMqls,
          source: "hubspot",
          category: "marketing",
          date: today
        }, {
          onConflict: "tenant_id,name,date",
          ignoreDuplicates: false
        }),
      
      // Recent MQLs (last 30 days)
      supabaseAdmin
        .from("kpis")
        .upsert({
          tenant_id,
          name: "recent_mqls",
          value: recentMqls,
          source: "hubspot",
          category: "marketing",
          date: today
        }, {
          onConflict: "tenant_id,name,date",
          ignoreDuplicates: false
        })
    ]);

    // Log the sync in system_logs
    await supabaseAdmin
      .from("system_logs")
      .insert({
        tenant_id,
        module: "plugin",
        event: "hubspot_mql_sync",
        context: { 
          total_mqls: newMqlCount,
          high_score_mqls: highScoreMqls,
          recent_mqls: recentMqls
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        count: newMqlCount,
        high_score_count: highScoreMqls,
        recent_count: recentMqls,
        kpi: kpiResult
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in syncHubSpotMQLs:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "An unknown error occurred",
        stack: error instanceof Error ? error.stack : undefined 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
