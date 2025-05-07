
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Stripe } from "https://esm.sh/stripe@12.0.0?target=deno";

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
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);
    
    // Initialize Stripe
    const stripeSecretKey = typeof Deno !== 'undefined' ? Deno.env.get("STRIPE_SECRET_KEY") : process.env.STRIPE_SECRET_KEY || '';
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });
    
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
          
          const currentDate = new Date().toISOString().split('T')[0];
            
          // Create KPI entry with proper typing
          const kpiData: KpiData = {
            tenant_id: tenant.id,
            name: "Monthly Recurring Revenue",
            value: mockMRR,
            previous_value: previousKpi?.value || null,
            source: "stripe",
            category: "financial",
            date: currentDate,
          };
            
          // Insert new KPI entry
          await supabaseAdmin
            .from("kpis")
            .insert(kpiData);
            
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
