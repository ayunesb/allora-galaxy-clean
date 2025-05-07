
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Stripe } from "https://esm.sh/stripe@12.0.0?target=deno";

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
      // Get Stripe customer ID from tenant metadata
      const stripeCustomerId = tenant.metadata?.stripe_customer_id;
      
      if (stripeCustomerId) {
        try {
          // Fetch MRR from Stripe
          // In a real implementation, you would use Stripe's API to get subscription data
          // Here we're just mocking the functionality
          
          // Calculate MRR (mock implementation)
          const mockMRR = Math.floor(Math.random() * 10000) + 5000;
          
          // Get the previous KPI entry
          const { data: previousKpi } = await supabaseAdmin
            .from("kpis")
            .select("value")
            .eq("tenant_id", tenant.id)
            .eq("name", "Monthly Recurring Revenue")
            .eq("source", "stripe")
            .order("date", { ascending: false })
            .limit(1)
            .single();
            
          // Insert new KPI entry
          await supabaseAdmin
            .from("kpis")
            .insert({
              tenant_id: tenant.id,
              name: "Monthly Recurring Revenue",
              value: mockMRR,
              previous_value: previousKpi?.value || null,
              source: "stripe",
              category: "financial",
              date: new Date().toISOString().split('T')[0],
            });
            
          console.log(`Updated MRR for tenant ${tenant.name}: $${mockMRR}`);
        } catch (error) {
          console.error(`Error updating MRR for tenant ${tenant.name}:`, error);
        }
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "KPIs updated successfully" }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
