
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

serve(async (req) => {
  try {
    // Create Supabase client with service role
    const supabaseUrl = typeof Deno !== 'undefined' ? Deno.env.get("SUPABASE_URL") : process.env.SUPABASE_URL || '';
    const supabaseServiceRole = typeof Deno !== 'undefined' ? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") : process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const hubspotToken = typeof Deno !== 'undefined' ? Deno.env.get("HUBSPOT_TOKEN") : process.env.HUBSPOT_TOKEN || '';
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);
    
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
            .insert(kpiData);
            
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
