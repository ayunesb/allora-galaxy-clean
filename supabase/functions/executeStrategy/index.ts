// Import Deno standard libraries and custom utilities
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateEnv, corsHeaders, logEnvStatus } from "../../../src/lib/edge/envManager.ts";

interface ExecuteStrategyRequest {
  strategyId: string;
  tenantId: string;
  plugins?: string[];
  input?: Record<string, any>;
}

// Validate all required environment variables at startup
const env = validateEnv([
  { 
    name: 'SUPABASE_URL', 
    required: true,
    description: 'Supabase project URL for database access'
  },
  { 
    name: 'SUPABASE_SERVICE_ROLE_KEY', 
    required: true,
    description: 'Service role key for admin database access'
  },
  { 
    name: 'EXECUTION_TIMEOUT_MS',
    required: false,
    fallback: '30000',
    description: 'Maximum execution time in milliseconds'
  }
]);

// Log environment status on startup
logEnvStatus(env);

// Create Supabase admin client with service role key
const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

// The main function handler
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Parse request body
    const requestData: ExecuteStrategyRequest = await req.json();
    const { strategyId, tenantId, plugins, input } = requestData;

    if (!strategyId || !tenantId) {
      throw new Error("Missing required parameters: strategyId and tenantId are required");
    }

    // Set execution timeout based on environment variable
    const timeoutMs = parseInt(env.EXECUTION_TIMEOUT_MS || '30000', 10);
    
    // Execute strategy with timeout
    const executionPromise = executeStrategy(strategyId, tenantId, plugins, input);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Execution timed out")), timeoutMs)
    );
    
    // Race the execution against the timeout
    const result = await Promise.race([executionPromise, timeoutPromise]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error executing strategy:", error);
    
    // Create structured error response
    const errorResponse = {
      success: false,
      error: error.message || "Unknown error occurred",
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function executeStrategy(
  strategyId: string,
  tenantId: string,
  plugins?: string[],
  input?: Record<string, any>
) {
  // Log the execution start
  console.log(`Executing strategy ${strategyId} for tenant ${tenantId}`);
  
  try {
    // Fetch the strategy details
    const { data: strategy, error: strategyError } = await supabaseAdmin
      .from('strategies')
      .select('*')
      .eq('id', strategyId)
      .eq('tenant_id', tenantId)
      .single();
    
    if (strategyError || !strategy) {
      throw new Error(`Strategy not found: ${strategyError?.message || 'No data returned'}`);
    }
    
    // Create execution record
    const { data: execution, error: executionError } = await supabaseAdmin
      .from('executions')
      .insert({
        strategy_id: strategyId,
        tenant_id: tenantId,
        type: 'strategy',
        status: 'pending',
        input: input || {}
      })
      .select()
      .single();
    
    if (executionError) {
      throw new Error(`Failed to create execution record: ${executionError.message}`);
    }
    
    // Determine which plugins to execute
    const pluginsToExecute = plugins || [];
    
    // Execute each plugin in sequence
    const results = [];
    let lastOutput = input || {};
    
    for (const pluginId of pluginsToExecute) {
      // Fetch plugin details
      const { data: plugin, error: pluginError } = await supabaseAdmin
        .from('plugins')
        .select('*')
        .eq('id', pluginId)
        .single();
      
      if (pluginError || !plugin) {
        console.warn(`Plugin ${pluginId} not found, skipping: ${pluginError?.message}`);
        continue;
      }
      
      // Get the latest active version of the plugin
      const { data: agentVersion, error: versionError } = await supabaseAdmin
        .from('agent_versions')
        .select('*')
        .eq('plugin_id', pluginId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (versionError || !agentVersion) {
        console.warn(`No active version found for plugin ${pluginId}, skipping`);
        continue;
      }
      
      // Execute the plugin
      try {
        console.log(`Executing plugin ${plugin.name} (${pluginId})`);
        
        // Here you would implement the actual plugin execution logic
        // This could involve calling an AI service, processing data, etc.
        const pluginResult = await executePlugin(
          plugin,
          agentVersion,
          lastOutput,
          tenantId
        );
        
        // Log the plugin execution
        await supabaseAdmin
          .from('plugin_logs')
          .insert({
            plugin_id: pluginId,
            strategy_id: strategyId,
            tenant_id: tenantId,
            agent_version_id: agentVersion.id,
            status: 'success',
            input: lastOutput,
            output: pluginResult,
            execution_time: 0, // You would calculate the actual execution time
            xp_earned: plugin.xp || 0
          });
        
        // Add to results and use as input for next plugin
        results.push({
          plugin_id: pluginId,
          plugin_name: plugin.name,
          output: pluginResult
        });
        
        lastOutput = {
          ...lastOutput,
          ...pluginResult
        };
      } catch (pluginExecutionError) {
        console.error(`Error executing plugin ${pluginId}:`, pluginExecutionError);
        
        // Log the failure
        await supabaseAdmin
          .from('plugin_logs')
          .insert({
            plugin_id: pluginId,
            strategy_id: strategyId,
            tenant_id: tenantId,
            agent_version_id: agentVersion.id,
            status: 'failure',
            input: lastOutput,
            error: pluginExecutionError.message,
            execution_time: 0,
            xp_earned: 0
          });
        
        // Add the error to results but continue with other plugins
        results.push({
          plugin_id: pluginId,
          plugin_name: plugin.name,
          error: pluginExecutionError.message
        });
      }
    }
    
    // Update the execution record with the final status
    await supabaseAdmin
      .from('executions')
      .update({
        status: 'success',
        output: {
          results,
          final: lastOutput
        }
      })
      .eq('id', execution.id);
    
    // Return the final results
    return {
      success: true,
      execution_id: execution.id,
      results,
      output: lastOutput
    };
  } catch (error) {
    console.error(`Strategy execution failed:`, error);
    
    // Update execution record with failure status if it was created
    if (execution?.id) {
      await supabaseAdmin
        .from('executions')
        .update({
          status: 'failure',
          error: error.message
        })
        .eq('id', execution.id);
    }
    
    throw error;
  }
}

// Helper function to execute a plugin
async function executePlugin(
  plugin: any,
  agentVersion: any,
  input: Record<string, any>,
  tenantId: string
): Promise<Record<string, any>> {
  // This is a placeholder for the actual plugin execution logic
  // In a real implementation, this would call an AI service or perform other operations
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return a mock result
  return {
    plugin_result: `Executed ${plugin.name} v${agentVersion.version}`,
    timestamp: new Date().toISOString(),
    processed_input: Object.keys(input)
  };
}

// Helper function to create Supabase client
function createClient(url: string, key: string) {
  return {
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: () => fetch(`${url}/rest/v1/${table}?select=${columns || '*'}&${column}=eq.${value}&limit=1`, {
            headers: {
              'apikey': key,
              'Authorization': `Bearer ${key}`,
              'Content-Type': 'application/json'
            }
          }).then(res => res.json())
            .then(data => ({ data: data[0] || null, error: null }))
            .catch(error => ({ data: null, error }))
        })
      }),
      insert: (data: any) => ({
        select: () => ({
          single: () => fetch(`${url}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
              'apikey': key,
              'Authorization': `Bearer ${key}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(data)
          }).then(res => res.json())
            .then(responseData => ({ data: responseData[0] || null, error: null }))
            .catch(error => ({ data: null, error }))
        })
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => fetch(`${url}/rest/v1/${table}?${column}=eq.${value}`, {
          method: 'PATCH',
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(data)
        }).then(res => res.json())
          .then(responseData => ({ data: responseData[0] || null, error: null }))
          .catch(error => ({ data: null, error }))
      })
    }),
    rpc: (functionName: string, params: any) => fetch(`${url}/rest/v1/rpc/${functionName}`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    }).then(res => res.json())
      .then(data => ({ data, error: null }))
      .catch(error => ({ data: null, error }))
  };
}
