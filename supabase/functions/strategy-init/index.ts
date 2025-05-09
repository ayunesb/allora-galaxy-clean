
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";

// Set up CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to safely get environment variables
function getEnv(name: string, fallback: string = ""): string {
  try {
    return Deno.env.get(name) || fallback;
  } catch (err) {
    console.error(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Supabase credentials from environment
    const supabaseUrl = getEnv('SUPABASE_URL');
    const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    // Initialize Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { tenantId, title, description, goals, persona } = await req.json();
    
    // Validate required fields
    if (!tenantId || !title) {
      return new Response(
        JSON.stringify({ success: false, error: 'Required fields missing: tenantId and title must be provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create a unique strategy ID
    const strategyId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Insert the initial strategy
    const { data: strategy, error: strategyError } = await supabase
      .from('strategies')
      .insert({
        id: strategyId,
        tenant_id: tenantId,
        title,
        description: description || `Strategy for ${title}`,
        status: 'pending',
        created_at: now,
        updated_at: now,
        tags: goals || [],
        priority: 'medium',
      })
      .select()
      .single();
    
    if (strategyError) {
      throw new Error(`Failed to create strategy: ${strategyError.message}`);
    }
    
    // Log the successful strategy creation
    await supabase.from('system_logs').insert({
      tenant_id: tenantId,
      module: 'strategy',
      event: 'strategy_created',
      context: {
        strategy_id: strategyId,
        title,
      }
    });
    
    // Return success response with created strategy
    return new Response(
      JSON.stringify({ 
        success: true, 
        strategy: {
          id: strategyId,
          title,
          description: strategy.description,
          status: strategy.status
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Strategy initialization error:', error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
