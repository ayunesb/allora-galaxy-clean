
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Get all tenants
    const { data: tenants, error: tenantsError } = await supabaseAdmin
      .from("tenants")
      .select("id, name");
      
    if (tenantsError) {
      throw new Error(`Error fetching tenants: ${tenantsError.message}`);
    }
    
    const alerts = [];
    
    // Process each tenant
    for (const tenant of tenants || []) {
      // Get KPIs with significant changes
      const { data: significantChanges, error: kpiError } = await supabaseAdmin
        .rpc('get_significant_kpi_changes', { 
          p_tenant_id: tenant.id,
          p_threshold: 20 // 20% change threshold
        });
        
      if (kpiError) {
        console.error(`Error finding KPI changes for tenant ${tenant.name}:`, kpiError);
        continue;
      }
      
      if (significantChanges && significantChanges.length > 0) {
        // For each significant change, create an alert
        for (const change of significantChanges) {
          console.log(`Alert for ${tenant.name}: ${change.name} changed by ${change.percent_change.toFixed(2)}%`);
          
          // In a real implementation, you would send email notifications here
          // For now, we're just logging the alerts
          
          // Add to our alerts array for reporting
          alerts.push({
            tenant_id: tenant.id,
            tenant_name: tenant.name,
            kpi_name: change.name,
            percent_change: change.percent_change,
            old_value: change.previous_value,
            new_value: change.value,
            date: change.date
          });
          
          // Log the system event
          await supabaseAdmin
            .from('system_logs')
            .insert({
              tenant_id: tenant.id,
              module: 'billing',
              event: `Significant ${change.percent_change > 0 ? 'increase' : 'decrease'} in ${change.name}`,
              context: {
                kpi_name: change.name,
                percent_change: change.percent_change,
                previous_value: change.previous_value,
                new_value: change.value,
                date: change.date
              }
            });
        }
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${alerts.length} milestone alerts`,
        alerts
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
