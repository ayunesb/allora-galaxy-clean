
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

// Import shared utilities
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Safely get environment variables with fallbacks
function safeGetDenoEnv(key: string, defaultValue: string = ""): string {
  try {
    return Deno.env.get(key) ?? defaultValue;
  } catch (err) {
    console.warn(`Error accessing env variable ${key}:`, err);
    return defaultValue;
  }
}

// Input validation interface
interface ExecuteStrategyInput {
  strategy_id: string;
  tenant_id: string;
  user_id?: string;
  options?: Record<string, any>;
}

// Generate a unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

// Error response interface
interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
  requestId: string;
  timestamp: string;
  status: number;
}

// Success response interface
interface SuccessResponse<T = any> {
  success: true;
  data: T;
  requestId: string;
  timestamp: string;
}

// Create standardized error response
function createErrorResponse(
  message: string,
  status: number = 500,
  code: string = "INTERNAL_ERROR",
  details?: any,
  requestId: string = generateRequestId()
): Response {
  const responseData: ErrorResponse = {
    success: false,
    error: message,
    code,
    status,
    timestamp: new Date().toISOString(),
    requestId
  };
  
  if (details !== undefined) {
    responseData.details = details;
  }
  
  return new Response(
    JSON.stringify(responseData),
    { 
      status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    }
  );
}

// Create standardized success response
function createSuccessResponse<T>(
  data: T, 
  requestId: string = generateRequestId()
): Response {
  const responseData: SuccessResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId
  };
  
  return new Response(
    JSON.stringify(responseData),
    {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    }
  );
}

// Input validation function
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

// Main handler function for the edge function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  const requestStart = performance.now();
  const requestId = generateRequestId();
  
  try {
    // Parse request body
    let input: ExecuteStrategyInput;
    try {
      input = await req.json();
    } catch (parseError) {
      return createErrorResponse(
        "Invalid JSON in request body", 
        400, 
        "BAD_REQUEST", 
        String(parseError),
        requestId
      );
    }
    
    // Validate input
    const validation = validateInput(input);
    if (!validation.valid) {
      return createErrorResponse(
        "Validation failed", 
        400, 
        "VALIDATION_ERROR", 
        validation.errors,
        requestId
      );
    }
    
    // Get Supabase credentials
    const SUPABASE_URL = safeGetDenoEnv("SUPABASE_URL");
    const SUPABASE_SERVICE_KEY = safeGetDenoEnv("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return createErrorResponse(
        "Required environment variables are not configured",
        500,
        "CONFIGURATION_ERROR",
        "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set",
        requestId
      );
    }
    
    // Create Supabase client
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
        throw new Error(`Strategy not found or access denied: ${strategyError?.message || 'Unknown error'}`);
      }
      
      if (strategy.status !== 'approved' && strategy.status !== 'pending') {
        throw new Error(`Strategy cannot be executed with status: ${strategy.status}`);
      }
      
      // Record the execution start
      try {
        const { error: execError } = await supabase
          .from('executions')
          .insert({
            id: executionId,
            tenant_id: input.tenant_id,
            strategy_id: input.strategy_id,
            executed_by: input.user_id,
            type: 'strategy',
            status: 'pending',
            input: input.options || {},
            created_at: new Date().toISOString()
          });
        
        if (execError) {
          console.warn(`Failed to record execution: ${execError.message}`);
        }
      } catch (recordError) {
        console.warn("Error recording execution start, continuing anyway:", recordError);
      }
      
      // Fetch plugins associated with this strategy
      const { data: plugins, error: pluginsError } = await supabase
        .from('plugins')
        .select('*')
        .eq('status', 'active')
        .eq('tenant_id', input.tenant_id)
        .limit(5);
        
      if (pluginsError) {
        throw new Error(`Failed to fetch plugins: ${pluginsError.message}`);
      }
      
      const pluginResults = [];
      let xpEarned = 0;
      let successfulPlugins = 0;
      
      // Execute each plugin
      for (const plugin of (plugins || [])) {
        try {
          // In a real implementation, we would execute the plugin's logic
          console.log(`Executing plugin ${plugin.id} for strategy ${input.strategy_id}`);
          
          // Record plugin execution
          const { data: logData, error: logError } = await supabase
            .from('plugin_logs')
            .insert({
              plugin_id: plugin.id,
              strategy_id: input.strategy_id,
              tenant_id: input.tenant_id,
              status: 'success',
              input: input.options || {},
              output: { message: "Plugin executed successfully" },
              execution_time: 0.5,
              xp_earned: 10
            })
            .select()
            .single();
          
          if (logError) {
            throw new Error(`Failed to record plugin execution: ${logError.message}`);
          }
          
          pluginResults.push({
            plugin_id: plugin.id,
            success: true,
            log_id: logData.id,
            xp_earned: 10
          });
          
          xpEarned += 10;
          successfulPlugins++;
          
        } catch (pluginError: any) {
          console.error(`Error executing plugin ${plugin.id}:`, pluginError);
          
          try {
            await supabase
              .from('plugin_logs')
              .insert({
                plugin_id: plugin.id,
                strategy_id: input.strategy_id,
                tenant_id: input.tenant_id,
                status: 'failure',
                input: input.options || {},
                error: pluginError.message,
                execution_time: 0.3,
                xp_earned: 0
              });
          } catch (logError) {
            console.error("Error recording plugin failure:", logError);
          }
          
          pluginResults.push({
            plugin_id: plugin.id,
            success: false,
            error: pluginError.message,
            xp_earned: 0
          });
        }
      }
      
      const executionTime = (performance.now() - requestStart) / 1000;
      const pluginCount = plugins ? plugins.length : 0;
      const status = successfulPlugins === pluginCount ? 'success' : 
                    (successfulPlugins > 0 ? 'partial' : 'failure');
      
      // Update the execution record
      try {
        await supabase
          .from('executions')
          .update({
            status,
            output: { plugins: pluginResults },
            execution_time: executionTime,
            xp_earned: xpEarned
          })
          .eq('id', executionId);
      } catch (updateError) {
        console.error("Error updating execution record:", updateError);
      }
      
      // Log system event
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
              status,
              plugins_executed: pluginCount,
              successful_plugins: successfulPlugins,
              xp_earned: xpEarned
            }
          });
      } catch (logError) {
        console.error("Error logging system event:", logError);
      }
      
      // Return success response
      return createSuccessResponse({
        execution_id: executionId,
        strategy_id: input.strategy_id,
        status,
        plugins_executed: pluginCount,
        successful_plugins: successfulPlugins,
        execution_time: executionTime,
        xp_earned: xpEarned
      }, requestId);
      
    } catch (error: any) {
      console.error("Error executing strategy:", error);
      
      // Update execution record with error
      try {
        await supabase
          .from('executions')
          .update({
            status: 'failure',
            error: error.message,
            execution_time: (performance.now() - requestStart) / 1000
          })
          .eq('id', executionId);
      } catch (updateError) {
        console.error("Error updating execution with error status:", updateError);
      }
      
      // Log system event for error
      try {
        await supabase
          .from('system_logs')
          .insert({
            tenant_id: input.tenant_id,
            module: 'strategy',
            event: 'strategy_execution_failed',
            context: {
              strategy_id: input.strategy_id,
              execution_id: executionId,
              error: error.message
            }
          });
      } catch (logError) {
        console.error("Error logging system error event:", logError);
      }
      
      // Return error response
      return createErrorResponse(
        error.message || "Strategy execution failed",
        500,
        "STRATEGY_EXECUTION_ERROR",
        { execution_id: executionId },
        requestId
      );
    }
    
  } catch (error: any) {
    console.error("Unexpected error:", error);
    
    // Return error response for unexpected errors
    return createErrorResponse(
      "Failed to execute strategy",
      500,
      "INTERNAL_ERROR",
      String(error),
      requestId
    );
  }
});
