
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

interface LeadData {
  id: string;
  email: string;
  name: string;
  status: string;
  score: number;
  created_at: string;
  source: string;
}

/**
 * Helper function to safely get environment variables with fallbacks
 */
function getEnv(name: string, fallback: string = ""): string {
  try {
    return Deno.env.get(name) ?? fallback;
  } catch (err) {
    console.warn(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

    // Create Supabase client with service role
    const supabaseUrl = getEnv("SUPABASE_URL");
    const supabaseServiceRole = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    const fallbackHubspotToken = getEnv("HUBSPOT_API_KEY");
    
    if (!supabaseUrl || !supabaseServiceRole) {
      return new Response(
        JSON.stringify({ error: "Supabase credentials not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);
    
    // Get tenants to process
    const tenantsQuery = supabaseAdmin.from("tenants").select("id, name, metadata");
    
    // Filter by specific tenant if provided
    if (specificTenantId) {
      tenantsQuery.eq("id", specificTenantId);
    }
    
    const { data: tenants, error: tenantsError } = await tenantsQuery;
      
    if (tenantsError) {
      throw new Error(`Error fetching tenants: ${tenantsError.message}`);
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
      const tenantHubspotApiKey = tenant.metadata?.hubspot_api_key || hubspotApiKey || fallbackHubspotToken;
      
      if (!tenantHubspotApiKey) {
        console.warn(`No HubSpot API key available for tenant ${tenant.name}, skipping`);
        results[tenant.id].skipped = true;
        results[tenant.id].reason = "No HubSpot API key available";
        continue;
      }
      
      try {
        // In a real implementation, you would use HubSpot's API to get MQL data
        // Here we're just mocking the functionality with random data that's consistent per tenant
        
        // Generate a stable but random seed based on tenant ID
        const tenantSeed = tenant.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const today = new Date();
        const daySeed = today.getDate() + today.getMonth() * 31;
        const randomSeed = tenantSeed + daySeed;
        
        // Mock MQL count - consistent for the same tenant on the same day
        const mockMQLCount = 100 + (randomSeed % 400);
        
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
          
        const currentDate = today.toISOString().split('T')[0];
          
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
        const { error: insertError } = await supabaseAdmin
          .from("kpis")
          .upsert(kpiData, { 
            onConflict: "tenant_id,name,date",
            ignoreDuplicates: false
          });
          
        if (insertError) {
          throw new Error(`Failed to insert MQL KPI: ${insertError.message}`);
        }
        
        results[tenant.id].metrics.push({
          name: "Marketing Qualified Leads",
          value: mockMQLCount,
          previous_value: previousKpi?.value
        });
        
        // Also track high-quality MQLs (score > 70)
        const mockHighQualityMQLs = Math.floor(mockMQLCount * 0.35);
        
        await supabaseAdmin
          .from("kpis")
          .upsert({
            tenant_id: tenant.id,
            name: "High Quality MQLs",
            value: mockHighQualityMQLs,
            source: "hubspot",
            category: "marketing",
            date: currentDate,
          }, { 
            onConflict: "tenant_id,name,date",
            ignoreDuplicates: false
          });
          
        results[tenant.id].metrics.push({
          name: "High Quality MQLs",
          value: mockHighQualityMQLs
        });
        
        // Conversion rate (percentage of MQLs that became SQLs)
        const mockConversionRate = 15 + (randomSeed % 25); // Between 15% and 40%
        
        await supabaseAdmin
          .from("kpis")
          .upsert({
            tenant_id: tenant.id,
            name: "MQL to SQL Conversion Rate",
            value: mockConversionRate,
            source: "hubspot",
            category: "marketing",
            date: currentDate,
          }, { 
            onConflict: "tenant_id,name,date",
            ignoreDuplicates: false
          });
          
        results[tenant.id].metrics.push({
          name: "MQL to SQL Conversion Rate",
          value: mockConversionRate
        });
          
        console.log(`Updated MQL count for tenant ${tenant.name}: ${mockMQLCount}`);

        // Generate mock leads data
        const mockLeads: LeadData[] = Array.from({ length: 10 }, (_, i) => ({
          id: `lead-${tenant.id.substring(0, 6)}-${i + 1}`,
          email: `lead${i+1}@example${tenant.id.substring(0, 4)}.com`,
          name: `Test Lead ${i+1}`,
          status: ['new', 'contacted', 'qualified'][i % 3],
          score: 60 + (i * 4) + (randomSeed % 20),
          created_at: new Date(today.getTime() - (i * 24 * 60 * 60 * 1000)).toISOString(),
          source: ['website', 'campaign', 'referral', 'organic'][i % 4]
        }));
        
        // Store some sample lead data for reference
        try {
          // Upsert leads table if it exists
          const { error: leadsTableError } = await supabaseAdmin
            .from("leads")
            .upsert(
              mockLeads.map(lead => ({
                ...lead,
                tenant_id: tenant.id
              })),
              { onConflict: "id", ignoreDuplicates: false }
            );
          
          if (leadsTableError && leadsTableError.code !== '42P01') { // Ignore table not found errors
            console.warn(`Could not update leads table: ${leadsTableError.message}`);
          }
        } catch (leadsError) {
          // Leads table might not exist, that's okay
          console.warn(`Leads table might not exist: ${leadsError}`);
        }

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
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `MQLs updated for ${Object.values(results).filter(r => !r.skipped).length} tenant(s)`,
        skipped: Object.values(results).filter(r => r.skipped).length,
        results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in syncMQLs:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Internal server error", 
        details: String(error)
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
