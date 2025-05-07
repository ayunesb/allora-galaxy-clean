
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Get all tenants
    const { data: tenants, error: tenantsError } = await supabaseAdmin
      .from("tenants")
      .select("id, name, metadata");
      
    if (tenantsError) {
      throw new Error(`Error fetching tenants: ${tenantsError.message}`);
    }
    
    // Process each tenant
    for (const tenant of tenants || []) {
      // Get HubSpot API key from tenant metadata
      const hubspotApiKey = tenant.metadata?.hubspot_api_key;
      
      if (hubspotApiKey) {
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
            .single();
            
          // Insert new KPI entry
          await supabaseAdmin
            .from("kpis")
            .insert({
              tenant_id: tenant.id,
              name: "Marketing Qualified Leads",
              value: mockMQLCount,
              previous_value: previousKpi?.value || null,
              source: "hubspot",
              category: "marketing",
              date: new Date().toISOString().split('T')[0],
            });
            
          console.log(`Updated MQL count for tenant ${tenant.name}: ${mockMQLCount}`);
        } catch (error) {
          console.error(`Error updating MQL count for tenant ${tenant.name}:`, error);
        }
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "MQLs updated successfully" }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
