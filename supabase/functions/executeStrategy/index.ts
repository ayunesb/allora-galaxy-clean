
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Helper function to safely get environment variables with fallbacks
 */
function getEnv(name: string, fallback: string = ""): string {
  try {
    // Check for Deno environment
    if (typeof Deno !== "undefined" && Deno?.env?.get) {
      return Deno.env.get(name) ?? fallback;
    }
    // Fallback to process.env for Node environments
    return process.env[name] || fallback;
  } catch (err) {
    console.warn(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

// Cors headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExecuteRequest {
  strategy_id: string;
  tenant_id: string;
  user_id?: string;
  options?: Record<string, any>;
}

// Function to validate input
function validateInput(input: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  
  if (!input) {
    errors.push("Request body is required");
    return { valid: false, errors };
  }
  
  if (!input.strategy_id) {
    errors.push("strategy_id is required");
  }
  
  if (!input.tenant_id) {
    errors.push("tenant_id is required");
  }
  
  return { valid: errors.length === 0, errors };
}

// Main handler function
serve(async (req) => {
  const startTime = performance.now();
  let executionId: string | null = null;
  
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Parse request body
    let input: ExecuteRequest;
    try {
      input = await req.json();
    } catch (parseError) {
      return new Response(JSON.stringify({ 
        error: "Invalid JSON in request body", 
        details: String(parseError) 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // Validate input
    const validation = validateInput(input);
    if (!validation.valid) {
      return new Response(JSON.stringify({ 
        error: "Invalid input", 
        details: validation.errors 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // Get Supabase credentials safely
    const SUPABASE_URL = getEnv("SUPABASE_URL");
    const SUPABASE_SERVICE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return new Response(JSON.stringify({ 
        error: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured" 
      }), { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // Create Supabase client with admin privileges
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Generate execution ID
    executionId = crypto.randomUUID();
    
    // Record execution start
    try {
      await supabase
        .from('executions')
        .insert({
          id: executionId,
          tenant_id: input.tenant_id,
          strategy_id: input.strategy_id,
          executed_by: input.user_id,
          type: 'strategy',
          status: 'pending',
          input: input,
          created_at: new Date().toISOString()
        });
    } catch (recordError) {
      console.error("Error recording execution start:", recordError);
      // Continue execution despite recording error
    }
    
    // Verify the strategy exists and belongs to the tenant (RLS enforcement)
    const { data: strategy, error: strategyError } = await supabase
      .from('strategies')
      .select('id, title, status')
      .eq('id', input.strategy_id)
      .eq('tenant_id', input.tenant_id)  // Enforce tenant_id match
      .single();
    
    if (strategyError || !strategy) {
      const errorMessage = `Strategy not found or access denied: ${strategyError?.message || 'Unknown error'}`;
      
      // Update execution record with error
      try {
        await supabase
          .from('executions')
          .update({
            status: 'failure',
            error: errorMessage,
            execution_time: (performance.now() - startTime) / 1000,
            updated_at: new Date().toISOString()
          })
          .eq('id', executionId);
      } catch (updateError) {
        console.error("Error updating execution record:", updateError);
      }
      
      return new Response(JSON.stringify({ 
        success: false,
        error: errorMessage,
        execution_id: executionId
      }), { 
        status: 404, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // Execute strategy logic here
    // For this implementation we'll simulate a successful execution
    const executionTime = (performance.now() - startTime) / 1000;
    
    // Update execution record with success
    try {
      await supabase
        .from('executions')
        .update({
          status: 'success',
          output: { 
            result: "Strategy executed successfully",
            strategy_id: input.strategy_id
          },
          execution_time: executionTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', executionId);
    } catch (updateError) {
      console.error("Error updating execution record:", updateError);
    }
    
    // Log successful execution to system_logs (with tenant_id for RLS)
    try {
      await supabase
        .from('system_logs')
        .insert({
          tenant_id: input.tenant_id,
          module: 'strategy',
          event: 'strategy_executed',
          context: {
            strategy_id: input.strategy_id,
            execution_id: executionId,
            execution_time: executionTime
          }
        });
    } catch (logError) {
      console.error("Error logging system event:", logError);
    }
    
    return new Response(JSON.stringify({
      success: true,
      execution_id: executionId,
      strategy_id: input.strategy_id,
      execution_time: executionTime
    }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
    
  } catch (error: any) {
    console.error("Error executing strategy:", error);
    
    // Try to update execution with error status
    try {
      if (executionId) {
        const SUPABASE_URL = getEnv("SUPABASE_URL");
        const SUPABASE_SERVICE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");
        
        if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
          const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
          
          await supabase
            .from('executions')
            .update({
              status: 'failure',
              error: String(error),
              execution_time: (performance.now() - startTime) / 1000,
              updated_at: new Date().toISOString()
            })
            .eq('id', executionId);
        }
      }
    } catch (updateError) {
      console.error("Error updating execution with error status:", updateError);
    }
    
    return new Response(JSON.stringify({ 
      success: false,
      error: "Failed to execute strategy", 
      details: String(error),
      execution_id: executionId
    }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
