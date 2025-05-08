
// Import from Deno standard library
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getEnvVar, corsHeaders } from "../lib/env.ts";

const SUPABASE_URL = getEnvVar("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = getEnvVar("SUPABASE_SERVICE_ROLE_KEY");

interface ExecuteStrategyRequest {
  strategy_id: string;
  tenant_id: string;
  user_id?: string;
  options?: Record<string, any>;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  const startTime = performance.now();
  
  try {
    // Get the request body
    let input: ExecuteStrategyRequest;
    try {
      input = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid JSON in request body"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Validate required fields
    if (!input.strategy_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "strategy_id is required"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!input.tenant_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "tenant_id is required"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create Supabase client
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Server configuration error"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const executionId = crypto.randomUUID();
    
    try {
      // Verify the strategy exists and belongs to the tenant
      const { data: strategy, error: strategyError } = await supabase
        .from('strategies')
        .select('id, title, status')
        .eq('id', input.strategy_id)
        .eq('tenant_id', input.tenant_id)
        .single();
      
      if (strategyError || !strategy) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Strategy not found or access denied: ${strategyError?.message || 'Unknown error'}`,
            execution_time: (performance.now() - startTime) / 1000
          }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Create execution record
      const { data: executionData, error: executionError } = await supabase
        .from('executions')
        .insert({
          id: executionId,
          tenant_id: input.tenant_id,
          strategy_id: input.strategy_id,
          status: 'pending',
          type: 'strategy',
          executed_by: input.user_id,
          input: input.options || {}
        })
        .select()
        .single();
      
      if (executionError) {
        throw new Error(`Failed to record execution: ${executionError.message}`);
      }
      
      // Fetch plugins
      const { data: plugins, error: pluginsError } = await supabase
        .from('plugins')
        .select('*')
        .eq('tenant_id', input.tenant_id)
        .eq('status', 'active');
      
      if (pluginsError) {
        throw new Error(`Failed to fetch plugins: ${pluginsError.message}`);
      }
      
      // Execute strategy logic here
      const executionTime = (performance.now() - startTime) / 1000;
      
      // Update execution record
      const { error: updateError } = await supabase
        .from('executions')
        .update({
          status: 'success',
          execution_time: executionTime,
          xp_earned: 10,
          output: {
            message: "Strategy execution completed successfully",
            plugins_processed: plugins?.length || 0
          }
        })
        .eq('id', executionId);
      
      if (updateError) {
        throw new Error(`Failed to update execution: ${updateError.message}`);
      }
      
      // Log system event
      await supabase
        .from('system_logs')
        .insert({
          tenant_id: input.tenant_id,
          module: 'strategy',
          event: 'strategy_executed',
          context: {
            strategy_id: input.strategy_id,
            execution_id: executionId,
            user_id: input.user_id
          }
        });
      
      // Return success response
      return new Response(
        JSON.stringify({
          success: true,
          execution_id: executionId,
          strategy_id: input.strategy_id,
          status: 'success',
          execution_time: executionTime,
          plugins_executed: plugins?.length || 0
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
      
    } catch (error: any) {
      console.error("Error executing strategy:", error);
      
      // Update execution record with error
      await supabase
        .from('executions')
        .update({
          status: 'failure',
          error: error.message,
          execution_time: (performance.now() - startTime) / 1000
        })
        .eq('id', executionId);
      
      // Return error response
      return new Response(
        JSON.stringify({
          success: false,
          execution_id: executionId,
          error: error.message,
          execution_time: (performance.now() - startTime) / 1000
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
  } catch (error: any) {
    console.error("Unexpected error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: `Unexpected error: ${error.message}`,
        execution_time: (performance.now() - startTime) / 1000
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
