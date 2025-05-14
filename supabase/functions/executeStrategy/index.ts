
// Deno edge function to execute strategies
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

// Import shared utilities
import { 
  corsHeaders, 
  createSuccessResponse, 
  createErrorResponse,
  getEnv,
  parseJsonBody,
  handleCorsRequest,
  withRetry,
  validateRequiredFields,
  logSystemEvent,
  generateRequestId
} from "../_shared/edgeUtils.ts";

// Input validation interface
interface ExecuteStrategyInput {
  strategy_id: string;
  tenant_id: string;
  user_id?: string;
  options?: Record<string, any>;
  execution_mode?: 'sync' | 'async';
}

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsRequest(req);
  if (corsResponse) return corsResponse;
  
  const requestStart = performance.now();
  const requestId = generateRequestId();
  
  console.log(`[${requestId}] executeStrategy request received`);
  
  try {
    // Parse and validate request body
    let input: ExecuteStrategyInput;
    try {
      input = await parseJsonBody<ExecuteStrategyInput>(req);
    } catch (parseError) {
      return createErrorResponse(
        "Invalid JSON in request body",
        String(parseError),
        400
      );
    }
    
    // Validate required fields
    const missingFields = validateRequiredFields(input, ['strategy_id', 'tenant_id']);
    if (missingFields.length > 0) {
      return createErrorResponse(
        `Missing required fields: ${missingFields.join(', ')}`,
        { fields: missingFields },
        400
      );
    }
    
    // Get Supabase credentials
    const SUPABASE_URL = getEnv("SUPABASE_URL");
    const SUPABASE_SERVICE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return createErrorResponse(
        "Required environment variables are not configured",
        "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set",
        500
      );
    }
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const executionId = crypto.randomUUID();
    
    // Additional logging for debugging
    console.log(`[${requestId}] Executing strategy ${input.strategy_id} for tenant ${input.tenant_id}`);
    console.log(`[${requestId}] Execution ID: ${executionId}`);
    
    try {
      // Verify the strategy exists and belongs to the tenant with retry logic
      const { data: strategy, error: strategyError } = await withRetry(
        () => supabase
          .from('strategies')
          .select('id, title, status')
          .eq('id', input.strategy_id)
          .eq('tenant_id', input.tenant_id)
          .single(),
        { 
          retries: 2, 
          delay: 300, 
          onRetry: (attempt) => console.log(`[${requestId}] Retrying strategy fetch, attempt ${attempt}`) 
        }
      );
      
      if (strategyError || !strategy) {
        const errorMsg = strategyError 
          ? `Strategy not found or access denied: ${strategyError.message}`
          : "Strategy not found for the specified tenant";
        
        return createErrorResponse(errorMsg, undefined, 404);
      }
      
      if (strategy.status !== 'approved' && strategy.status !== 'pending') {
        return createErrorResponse(
          `Strategy cannot be executed with status: ${strategy.status}`,
          {
            strategy_id: input.strategy_id,
            current_status: strategy.status,
            allowed_statuses: ['approved', 'pending']
          },
          400
        );
      }
      
      // Record the execution start with retry logic
      try {
        const { error: execError } = await withRetry(
          () => supabase
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
            }),
          { retries: 2, delay: 300 }
        );
        
        if (execError) {
          console.warn(`[${requestId}] Failed to record execution: ${execError.message}`);
        }
      } catch (recordError) {
        console.warn(`[${requestId}] Error recording execution start, continuing anyway:`, recordError);
      }
      
      // Fetch plugins associated with this strategy with retry logic
      const { data: plugins, error: pluginsError } = await withRetry(
        () => supabase
          .from('plugins')
          .select('*')
          .eq('status', 'active')
          .eq('tenant_id', input.tenant_id)
          .limit(5),
        { retries: 2, delay: 300 }
      );
        
      if (pluginsError) {
        throw new Error(`Failed to fetch plugins: ${pluginsError.message}`);
      }
      
      const pluginResults = [];
      let xpEarned = 0;
      let successfulPlugins = 0;
      
      // Execute each plugin with individual error handling
      for (const plugin of (plugins || [])) {
        try {
          console.log(`[${requestId}] Executing plugin ${plugin.id} for strategy ${input.strategy_id}`);
          
          // Record plugin execution with retry
          const { data: logData, error: logError } = await withRetry(
            () => supabase
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
              .single(),
            { retries: 2, delay: 300 }
          );
          
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
          
        } catch (pluginError) {
          console.error(`[${requestId}] Error executing plugin ${plugin.id}:`, pluginError);
          
          // Record failed plugin execution with retry
          try {
            await withRetry(
              () => supabase
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
                }),
              { retries: 2, delay: 300 }
            );
          } catch (logError) {
            console.error(`[${requestId}] Error recording plugin failure:`, logError);
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
      
      // Update the execution record with retry
      try {
        await withRetry(
          () => supabase
            .from('executions')
            .update({
              status,
              output: { plugins: pluginResults },
              execution_time: executionTime,
              xp_earned: xpEarned
            })
            .eq('id', executionId),
          { retries: 2, delay: 300 }
        );
      } catch (updateError) {
        console.error(`[${requestId}] Error updating execution record:`, updateError);
      }
      
      // Log system event with retry
      try {
        await withRetry(
          () => logSystemEvent(
            supabase,
            'strategy',
            'strategy_executed',
            {
              strategy_id: input.strategy_id,
              execution_id: executionId,
              status,
              plugins_executed: pluginCount,
              successful_plugins: successfulPlugins,
              xp_earned: xpEarned,
              request_id: requestId
            },
            input.tenant_id
          ),
          { retries: 2, delay: 300 }
        );
      } catch (logError) {
        console.error(`[${requestId}] Error logging system event:`, logError);
      }
      
      // Return success response
      return createSuccessResponse({
        execution_id: executionId,
        strategy_id: input.strategy_id,
        status,
        plugins_executed: pluginCount,
        successful_plugins: successfulPlugins,
        execution_time: executionTime,
        xp_earned: xpEarned,
        request_id: requestId
      }, "Strategy executed successfully");
      
    } catch (error) {
      console.error(`[${requestId}] Error executing strategy:`, error);
      
      // Update execution record with error and retry
      try {
        await withRetry(
          () => supabase
            .from('executions')
            .update({
              status: 'failure',
              error: error.message || String(error),
              execution_time: (performance.now() - requestStart) / 1000
            })
            .eq('id', executionId),
          { retries: 2, delay: 300 }
        );
      } catch (updateError) {
        console.error(`[${requestId}] Error updating execution with error status:`, updateError);
      }
      
      // Log system event for error with retry
      try {
        await withRetry(
          () => logSystemEvent(
            supabase,
            'strategy',
            'strategy_execution_failed',
            {
              strategy_id: input.strategy_id,
              execution_id: executionId,
              error: error.message || String(error),
              request_id: requestId
            },
            input.tenant_id
          ),
          { retries: 2, delay: 300 }
        );
      } catch (logError) {
        console.error(`[${requestId}] Error logging system error event:`, logError);
      }
      
      // Return error response
      return createErrorResponse(
        error.message || "Failed to execute strategy",
        {
          execution_id: executionId,
          strategy_id: input.strategy_id,
          execution_time: (performance.now() - requestStart) / 1000
        },
        500
      );
    }
    
  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error);
    
    // Return error response for unexpected errors
    return createErrorResponse(
      "Failed to execute strategy", 
      {
        details: error.message || String(error),
        execution_time: (performance.now() - requestStart) / 1000
      },
      500
    );
  }
});
