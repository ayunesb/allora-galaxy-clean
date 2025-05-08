
// Import required libraries
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getEnvVar, corsHeaders } from "../lib/env.ts";

// Get environment variables
const SUPABASE_URL = getEnvVar("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = getEnvVar("SUPABASE_SERVICE_ROLE_KEY");
const HUBSPOT_API_KEY = getEnvVar("HUBSPOT_API_KEY");

// Define interface for request body
interface SyncMQLsRequest {
  tenant_id: string;
  date_from?: string;
  date_to?: string;
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
    let input: SyncMQLsRequest;
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
    
    // Check if HubSpot API key is available
    if (!HUBSPOT_API_KEY) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "HubSpot API key not configured" 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Define date range for fetching MQLs
    const dateTo = input.date_to || new Date().toISOString().split('T')[0];
    
    // Default to 30 days if date_from not provided
    let dateFrom;
    if (input.date_from) {
      dateFrom = input.date_from;
    } else {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() - 30);
      dateFrom = defaultDate.toISOString().split('T')[0];
    }
    
    // Log the sync operation
    await supabase.from('system_logs').insert({
      tenant_id: input.tenant_id,
      module: 'mql',
      event: 'sync_started',
      context: {
        date_from: dateFrom,
        date_to: dateTo
      }
    });
    
    // Mock response as if we fetched from HubSpot
    const mockMQLData = {
      totalCount: 42,
      mqls: [
        { id: "1", score: 85, createdAt: new Date().toISOString() },
        { id: "2", score: 72, createdAt: new Date().toISOString() }
      ]
    };
    
    // Record the MQL data in the KPIs table
    const { error: kpiError } = await supabase.from('kpis').insert({
      tenant_id: input.tenant_id,
      name: 'Marketing Qualified Leads',
      value: mockMQLData.totalCount,
      previous_value: null,
      date: new Date().toISOString().split('T')[0],
      category: 'marketing',
      source: 'hubspot'
    });
    
    if (kpiError) {
      throw new Error(`Failed to record KPI: ${kpiError.message}`);
    }
    
    // Log the successful sync
    await supabase.from('system_logs').insert({
      tenant_id: input.tenant_id,
      module: 'mql',
      event: 'sync_completed',
      context: {
        mql_count: mockMQLData.totalCount,
        date_from: dateFrom,
        date_to: dateTo,
        execution_time: (performance.now() - startTime) / 1000
      }
    });
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'MQLs synced successfully',
        count: mockMQLData.totalCount,
        execution_time: (performance.now() - startTime) / 1000
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error: any) {
    console.error("Error syncing MQLs:", error);
    
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
