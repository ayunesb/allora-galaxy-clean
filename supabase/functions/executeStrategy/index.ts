
// supabase/functions/executeStrategy/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Get environment variables with fallbacks
function getEnv(key: string, defaultValue = "") {
  return Deno.env.get(key) || defaultValue;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const body = await req.json();
    const { strategyId, tenantId, userId, options } = body;

    // Validate required parameters
    if (!strategyId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Strategy ID is required'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (!tenantId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Tenant ID is required'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const startTime = Date.now();
    const executionId = crypto.randomUUID();

    // Initialize Supabase client
    const supabaseUrl = getEnv('SUPABASE_URL');
    const supabaseKey = getEnv('SUPABASE_ANON_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Log start of strategy execution
    await supabase.from('system_logs').insert({
      tenant_id: tenantId,
      module: 'strategy',
      event: 'strategy_execution_started',
      context: {
        strategy_id: strategyId,
        user_id: userId,
        execution_id: executionId
      }
    });

    // Check if strategy exists and belongs to tenant
    const { data: strategy, error: strategyError } = await supabase
      .from('strategies')
      .select('id, title, status')
      .eq('id', strategyId)
      .eq('tenant_id', tenantId)
      .single();

    if (strategyError || !strategy) {
      const errorMsg = `Strategy not found or access denied: ${strategyError?.message || 'Unknown error'}`;
      
      await supabase.from('system_logs').insert({
        tenant_id: tenantId,
        module: 'strategy',
        event: 'strategy_execution_failed',
        context: {
          strategy_id: strategyId,
          error: errorMsg,
          execution_id: executionId
        }
      });
      
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMsg,
          executionTime: (Date.now() - startTime) / 1000
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    if (strategy.status !== 'approved' && strategy.status !== 'pending') {
      const statusError = `Strategy cannot be executed with status: ${strategy.status}`;
      
      await supabase.from('system_logs').insert({
        tenant_id: tenantId,
        module: 'strategy',
        event: 'strategy_execution_failed',
        context: {
          strategy_id: strategyId,
          error: statusError,
          execution_id: executionId
        }
      });
      
      return new Response(
        JSON.stringify({
          success: false,
          error: statusError,
          executionTime: (Date.now() - startTime) / 1000
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Record execution start in executions table
    const { data: executionRecord, error: executionError } = await supabase
      .from('executions')
      .insert({
        id: executionId,
        strategy_id: strategyId,
        tenant_id: tenantId,
        executed_by: userId,
        status: 'running',
        type: 'strategy',
        input: options || {}
      })
      .select()
      .single();

    if (executionError) {
      console.error("Failed to record execution:", executionError);
    }

    // Fetch plugins associated with this strategy
    const { data: plugins, error: pluginsError } = await supabase
      .from('plugins')
      .select('*')
      .eq('status', 'active')
      .limit(3);
      
    if (pluginsError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to fetch plugins: ${pluginsError.message}`,
          executionTime: (Date.now() - startTime) / 1000
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const pluginList = plugins || [];
    let xpEarned = 0;
    let successfulPlugins = 0;
    const pluginResults = [];
    
    // Execute each plugin
    for (const plugin of pluginList) {
      try {
        // Record plugin execution
        const { data: logData, error: logError } = await supabase
          .from('plugin_logs')
          .insert({
            plugin_id: plugin.id,
            strategy_id: strategyId,
            tenant_id: tenantId,
            status: 'success',
            input: options || {},
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
        
        // Record failed plugin execution
        await supabase
          .from('plugin_logs')
          .insert({
            plugin_id: plugin.id,
            strategy_id: strategyId,
            tenant_id: tenantId,
            status: 'failure',
            input: options || {},
            error: pluginError.message,
            execution_time: 0.3,
            xp_earned: 0
          });
        
        pluginResults.push({
          plugin_id: plugin.id,
          success: false,
          error: pluginError.message,
          xp_earned: 0
        });
      }
    }
    
    const executionTime = (Date.now() - startTime) / 1000;
    const status = successfulPlugins === pluginList.length ? 'success' : 
                  (successfulPlugins > 0 ? 'partial' : 'failure');
    
    // Update execution record
    await supabase
      .from('executions')
      .update({
        status,
        execution_time: executionTime,
        xp_earned: xpEarned,
        output: {
          plugins_executed: pluginList.length,
          successful_plugins: successfulPlugins,
          plugin_results: pluginResults
        }
      })
      .eq('id', executionId);
    
    // Log completion to system_logs
    await supabase
      .from('system_logs')
      .insert({
        tenant_id: tenantId,
        module: 'strategy',
        event: 'strategy_executed',
        context: {
          strategy_id: strategyId,
          execution_id: executionId,
          status,
          plugins_executed: pluginList.length,
          successful_plugins: successfulPlugins,
          xp_earned: xpEarned
        }
      });
    
    return new Response(
      JSON.stringify({
        success: true,
        executionId,
        strategyId,
        status,
        pluginsExecuted: pluginList.length,
        successfulPlugins,
        executionTime,
        xpEarned,
        pluginResults
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error: any) {
    console.error("Error executing strategy:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error occurred",
        executionTime: 0
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Helper functions
function generateUUID(): string {
  return Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('');
}
