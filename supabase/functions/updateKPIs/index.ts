
// Import required libraries
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@13.7.0?target=deno";
import { getEnvVar, corsHeaders } from "../lib/env.ts";

// Get environment variables
const SUPABASE_URL = getEnvVar("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = getEnvVar("SUPABASE_SERVICE_ROLE_KEY");
const STRIPE_SECRET_KEY = getEnvVar("STRIPE_SECRET_KEY");

// Define interfaces for request and response
interface UpdateKPIsRequest {
  tenant_id: string;
  sources?: string[];
}

interface KPIEntry {
  name: string;
  value: number;
  previous_value?: number;
  category?: string;
  source?: string;
}

interface UpdateKPIsResponse {
  success: boolean;
  message?: string;
  error?: string;
  results?: Record<string, { metrics: KPIEntry[] }>;
}

// Main handler function
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  const startTime = performance.now();
  
  try {
    // Parse request body
    let input: UpdateKPIsRequest;
    try {
      input = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid JSON in request body" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Validate required fields
    if (!input.tenant_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "tenant_id is required" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Initialize Supabase client
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Server configuration error: Missing Supabase credentials" 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Log the update operation
    await supabase.from('system_logs').insert({
      tenant_id: input.tenant_id,
      module: 'kpi',
      event: 'update_started',
      context: {
        sources: input.sources || ['all']
      }
    });
    
    // Determine which KPIs to update
    const sources = input.sources || ['stripe', 'ga4', 'hubspot', 'system'];
    const results: Record<string, { metrics: KPIEntry[] }> = {};
    results[input.tenant_id] = { metrics: [] };
    
    // Update KPIs from Stripe
    if (sources.includes('stripe')) {
      if (!STRIPE_SECRET_KEY) {
        console.warn("Stripe KPI update requested but no API key configured");
      } else {
        try {
          // Mock Stripe data
          const mrr = 8500;
          const previousMrr = 8000;
          const cac = 350;
          
          // Record MRR
          await supabase.from('kpis').insert({
            tenant_id: input.tenant_id,
            name: 'Monthly Recurring Revenue',
            value: mrr,
            previous_value: previousMrr,
            date: new Date().toISOString().split('T')[0],
            category: 'financial',
            source: 'stripe'
          });
          
          // Record Customer Acquisition Cost
          await supabase.from('kpis').insert({
            tenant_id: input.tenant_id,
            name: 'Customer Acquisition Cost',
            value: cac,
            date: new Date().toISOString().split('T')[0],
            category: 'financial',
            source: 'stripe'
          });
          
          // Add to results
          results[input.tenant_id].metrics.push(
            { name: 'Monthly Recurring Revenue', value: mrr, previous_value: previousMrr },
            { name: 'Customer Acquisition Cost', value: cac }
          );
          
        } catch (stripeError: any) {
          console.error("Error updating Stripe KPIs:", stripeError);
          
          // Log the error but continue with other KPIs
          await supabase.from('system_logs').insert({
            tenant_id: input.tenant_id,
            module: 'kpi',
            event: 'stripe_update_error',
            context: {
              error: stripeError.message
            }
          });
        }
      }
    }
    
    // Update KPIs from GA4 (mock)
    if (sources.includes('ga4')) {
      try {
        // Mock GA4 data
        const visitors = 12500;
        const previousVisitors = 10800;
        const conversionRate = 2.8;
        
        // Record Website Visitors
        await supabase.from('kpis').insert({
          tenant_id: input.tenant_id,
          name: 'Website Visitors',
          value: visitors,
          previous_value: previousVisitors,
          date: new Date().toISOString().split('T')[0],
          category: 'marketing',
          source: 'ga4'
        });
        
        // Record Conversion Rate
        await supabase.from('kpis').insert({
          tenant_id: input.tenant_id,
          name: 'Conversion Rate',
          value: conversionRate,
          date: new Date().toISOString().split('T')[0],
          category: 'marketing',
          source: 'ga4'
        });
        
        // Add to results
        results[input.tenant_id].metrics.push(
          { name: 'Website Visitors', value: visitors, previous_value: previousVisitors },
          { name: 'Conversion Rate', value: conversionRate }
        );
        
      } catch (ga4Error: any) {
        console.error("Error updating GA4 KPIs:", ga4Error);
        
        // Log the error but continue with other KPIs
        await supabase.from('system_logs').insert({
          tenant_id: input.tenant_id,
          module: 'kpi',
          event: 'ga4_update_error',
          context: {
            error: ga4Error.message
          }
        });
      }
    }
    
    // Log the successful update
    await supabase.from('system_logs').insert({
      tenant_id: input.tenant_id,
      module: 'kpi',
      event: 'update_completed',
      context: {
        updated_metrics: results[input.tenant_id].metrics.length,
        execution_time: (performance.now() - startTime) / 1000
      }
    });
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'KPIs updated successfully',
        results,
        execution_time: (performance.now() - startTime) / 1000
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error: any) {
    console.error("Error updating KPIs:", error);
    
    // Return error response
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        execution_time: (performance.now() - startTime) / 1000
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
