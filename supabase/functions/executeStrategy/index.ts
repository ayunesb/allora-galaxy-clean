
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getEnv } from "../../../src/lib/utils/env.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define required environment variables
const requiredEnv = [
  { name: 'SUPABASE_URL', required: true, description: 'Supabase project URL' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: true, description: 'Service role key for admin access' }
];

// Validate environment variables
function validateEnv(envVars) {
  const result = {};
  const missing = [];

  for (const envVar of envVars) {
    const value = getEnv(envVar.name);
    result[envVar.name] = value;

    if (envVar.required && !value) {
      missing.push(`${envVar.name} (${envVar.description})`);
    }
  }

  if (missing.length > 0) {
    console.warn(`⚠️ Missing required environment variables: ${missing.join(', ')}`);
  }

  return result;
}

// Validate input for strategy execution
function validateInput(input) {
  const errors = [];
  
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

// Format error response
function formatErrorResponse(status, message, details = null) {
  const body = {
    error: message,
    details: details || null,
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Validate environment variables at startup
const env = validateEnv(requiredEnv);

// Create Supabase admin client outside handler for better performance
const supabaseAdmin = env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// Main function handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if Supabase client was initialized
  if (!supabaseAdmin) {
    return formatErrorResponse(500, "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured");
  }

  try {
    // Parse request body
    let input;
    try {
      input = await req.json();
    } catch (parseError) {
      return formatErrorResponse(400, "Invalid JSON in request body", String(parseError));
    }
    
    // Validate input
    const validation = validateInput(input);
    if (!validation.valid) {
      return formatErrorResponse(400, "Invalid input", validation.errors);
    }
    
    // Execute the strategy
    const startTime = performance.now();
    const executionId = crypto.randomUUID();
    
    try {
      // Verify the strategy exists and belongs to the tenant
      const { data: strategy, error: strategyError } = await supabaseAdmin
        .from('strategies')
        .select('id, title, status, completion_percentage')
        .eq('id', input.strategy_id)
        .eq('tenant_id', input.tenant_id)
        .single();
      
      if (strategyError || !strategy) {
        throw new Error(`Strategy not found or access denied: ${strategyError?.message || 'Unknown error'}`);
      }
      
      // Record execution start
      const { error: execError } = await supabaseAdmin
        .from('executions')
        .insert({
          id: executionId,
          tenant_id: input.tenant_id,
          strategy_id: input.strategy_id,
          executed_by: input.user_id || null,
          type: 'strategy',
          status: 'pending',
          input: input.options || {}
        });
      
      if (execError) {
        console.error(`Failed to record execution: ${execError.message}`);
      }
      
      // For this simplified example, we'll just return a success response
      const executionTime = (performance.now() - startTime) / 1000;
      
      return new Response(JSON.stringify({
        success: true,
        execution_id: executionId,
        strategy_id: input.strategy_id,
        message: "Strategy execution initiated successfully",
        execution_time: executionTime
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
      
    } catch (error) {
      console.error("Error executing strategy:", error);
      
      // Update execution record with error
      try {
        await supabaseAdmin
          .from('executions')
          .update({
            status: 'failure',
            error: error.message,
            execution_time: (performance.now() - startTime) / 1000
          })
          .eq('id', executionId);
      } catch (updateError) {
        console.error("Error updating execution with error status:", updateError);
      }
      
      return formatErrorResponse(500, "Error executing strategy", error.message);
    }
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return formatErrorResponse(500, "Failed to process request", String(error));
  }
});
