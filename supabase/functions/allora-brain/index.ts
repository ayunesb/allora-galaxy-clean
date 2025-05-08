
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Helper function to safely get environment variables
function getEnv(name: string, fallback: string = ""): string {
  try {
    return Deno.env.get(name) ?? fallback;
  } catch (err) {
    console.error(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface BrainQueryParams {
  query: string;
  tenantId?: string;
  strategy?: string;
  plugin?: string;
  context?: Record<string, any>;
}

async function createSupabaseClient() {
  const supabaseUrl = getEnv("SUPABASE_URL");
  const supabaseServiceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase credentials");
  }
  
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  return createClient(supabaseUrl, supabaseServiceKey);
}

async function findOrCreateStrategy(supabase: any, query: string, tenantId: string): Promise<any> {
  // Check if there's an existing strategy for this query
  const { data: existingStrategies, error: searchError } = await supabase
    .from('strategies')
    .select('*')
    .eq('tenant_id', tenantId)
    .ilike('description', `%${query}%`)
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (searchError) {
    throw new Error(`Error searching for strategies: ${searchError.message}`);
  }
  
  // Return existing strategy if found
  if (existingStrategies && existingStrategies.length > 0) {
    console.log("Found existing strategy:", existingStrategies[0].id);
    return existingStrategies[0];
  }
  
  // Create a new strategy based on the query
  const { data: newStrategy, error: createError } = await supabase
    .from('strategies')
    .insert({
      title: `Auto-generated for "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"`,
      description: query,
      tenant_id: tenantId,
      status: 'approved', // Auto-approve for API usage
      created_by: 'system',
      approved_by: 'system',
      source: 'api',
      metadata: { query_origin: 'allora-brain-api' }
    })
    .select()
    .single();
  
  if (createError) {
    throw new Error(`Error creating strategy: ${createError.message}`);
  }
  
  console.log("Created new strategy:", newStrategy.id);
  return newStrategy;
}

async function executeStrategyWithPlugins(
  supabase: any,
  strategy: any,
  tenantId: string,
  specificPlugin: string | undefined,
  context: Record<string, any> = {}
): Promise<any> {
  try {
    // Start execution
    const executionId = crypto.randomUUID();
    
    // Record execution start
    await supabase
      .from('executions')
      .insert({
        id: executionId,
        strategy_id: strategy.id,
        tenant_id: tenantId,
        type: 'strategy',
        status: 'pending',
        executed_by: 'system',
        source: 'allora-brain-api',
        input: { context, specific_plugin: specificPlugin }
      });
    
    // Get plugins to execute
    let pluginsQuery = supabase
      .from('plugins')
      .select('*')
      .eq('status', 'active')
      .eq('tenant_id', tenantId);
    
    if (specificPlugin) {
      pluginsQuery = pluginsQuery.eq('id', specificPlugin);
    }
    
    const { data: plugins, error: pluginsError } = await pluginsQuery;
    
    if (pluginsError) {
      throw new Error(`Error fetching plugins: ${pluginsError.message}`);
    }
    
    if (!plugins || plugins.length === 0) {
      throw new Error(specificPlugin ? 
        `Plugin ${specificPlugin} not found or not active` : 
        `No active plugins found for tenant ${tenantId}`
      );
    }
    
    // Execute plugins
    const results = [];
    let xpEarned = 0;
    let successfulPlugins = 0;
    
    for (const plugin of plugins) {
      try {
        console.log(`Executing plugin ${plugin.name} (${plugin.id}) for strategy ${strategy.id}`);
        
        // Simulate plugin execution (replace with actual implementation)
        const pluginOutput = {
          result: `Plugin ${plugin.name} processed query: "${strategy.description}"`,
          context: { ...context },
          timestamp: new Date().toISOString()
        };
        
        // Log successful execution
        await supabase
          .from('plugin_logs')
          .insert({
            plugin_id: plugin.id,
            strategy_id: strategy.id,
            tenant_id: tenantId,
            status: 'success',
            input: { query: strategy.description, context },
            output: pluginOutput,
            execution_time: 1.0, // Simulated execution time
            xp_earned: plugin.xp || 10
          });
        
        results.push({
          plugin_id: plugin.id,
          plugin_name: plugin.name,
          success: true,
          output: pluginOutput,
          xp_earned: plugin.xp || 10
        });
        
        xpEarned += (plugin.xp || 10);
        successfulPlugins++;
      } catch (pluginError: any) {
        console.error(`Error executing plugin ${plugin.id}:`, pluginError);
        
        // Log failed execution
        await supabase
          .from('plugin_logs')
          .insert({
            plugin_id: plugin.id,
            strategy_id: strategy.id,
            tenant_id: tenantId,
            status: 'error',
            input: { query: strategy.description, context },
            error: pluginError.message || 'Unknown error',
            execution_time: 0.5, // Simulated execution time
            xp_earned: 0
          });
        
        results.push({
          plugin_id: plugin.id,
          plugin_name: plugin.name,
          success: false,
          error: pluginError.message || 'Unknown error',
          xp_earned: 0
        });
      }
    }
    
    // Update execution record with results
    const executionStatus = successfulPlugins === plugins.length ? 'success' : 
                           (successfulPlugins > 0 ? 'partial' : 'failure');
    
    await supabase
      .from('executions')
      .update({
        status: executionStatus,
        output: { 
          results,
          summary: `Executed ${successfulPlugins}/${plugins.length} plugins successfully` 
        },
        execution_time: 2.0, // Simulated total execution time
        xp_earned: xpEarned,
        completed_at: new Date().toISOString()
      })
      .eq('id', executionId);
    
    // Log system event
    await supabase
      .from('system_logs')
      .insert({
        tenant_id: tenantId,
        module: 'strategy',
        event: 'allora_brain_api_execution',
        context: {
          strategy_id: strategy.id,
          execution_id: executionId,
          plugins_executed: plugins.length,
          successful_plugins: successfulPlugins,
          xp_earned: xpEarned
        }
      });
    
    return {
      success: true,
      strategy_id: strategy.id,
      execution_id: executionId,
      status: executionStatus,
      plugins_executed: plugins.length,
      successful_plugins: successfulPlugins,
      xp_earned: xpEarned,
      results
    };
  } catch (error: any) {
    console.error('Error executing strategy:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
      strategy_id: strategy.id
    };
  }
}

async function validateApiKey(supabase: any, apiKey: string): Promise<string> {
  if (!apiKey) {
    throw new Error('API key is required');
  }
  
  // Check the API key in the api_keys table
  const { data, error } = await supabase
    .from('api_keys')
    .select('tenant_id, name')
    .eq('key', apiKey)
    .eq('status', 'active')
    .single();
  
  if (error || !data) {
    throw new Error('Invalid or expired API key');
  }
  
  console.log(`API key "${data.name}" validated for tenant ${data.tenant_id}`);
  return data.tenant_id;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ 
        error: 'Only POST requests are supported' 
      }), { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    // Get the API key from headers
    const apiKey = req.headers.get('x-api-key');
    
    // Parse request body
    const params: BrainQueryParams = await req.json();
    
    if (!params.query) {
      return new Response(JSON.stringify({ 
        error: 'Query is required' 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    // Initialize Supabase client
    const supabase = await createSupabaseClient();
    
    // Validate API key and get tenant
    let tenantId: string;
    try {
      tenantId = await validateApiKey(supabase, apiKey || '');
    } catch (authError: any) {
      return new Response(JSON.stringify({ 
        error: authError.message || 'Authentication failed' 
      }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    // Use provided tenant ID if it exists and matches the API key's tenant
    if (params.tenantId && params.tenantId !== tenantId) {
      return new Response(JSON.stringify({ 
        error: 'Provided tenant ID does not match API key' 
      }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    // Process query using existing or new strategy
    let strategy;
    if (params.strategy) {
      // Get the specified strategy if it belongs to this tenant
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('id', params.strategy)
        .eq('tenant_id', tenantId)
        .single();
      
      if (error || !data) {
        return new Response(JSON.stringify({ 
          error: 'Strategy not found or access denied' 
        }), { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }
      
      strategy = data;
    } else {
      // Find or create a strategy based on the query
      strategy = await findOrCreateStrategy(supabase, params.query, tenantId);
    }
    
    // Execute the strategy with plugins
    const result = await executeStrategyWithPlugins(
      supabase, 
      strategy, 
      tenantId, 
      params.plugin, 
      params.context || {}
    );
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('Unexpected error:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'An unexpected error occurred' 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
