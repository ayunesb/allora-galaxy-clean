
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

// Define the Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const XP_PROMOTION_THRESHOLD = 1000;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get agent versions that have reached the XP threshold but are still in training
    const { data: agentsToPromote, error } = await supabase
      .from('agent_versions')
      .select('id, plugin_id, version, xp, tenant_id')
      .eq('status', 'training')
      .gte('xp', XP_PROMOTION_THRESHOLD);
      
    if (error) {
      throw error;
    }
    
    // Count successful promotions
    let promotedCount = 0;
    const errors: string[] = [];
    
    // Process each agent that needs promotion
    for (const agent of agentsToPromote || []) {
      try {
        // Update the agent status to active
        const { error: updateError } = await supabase
          .from('agent_versions')
          .update({
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', agent.id);
          
        if (updateError) {
          throw updateError;
        }
        
        // Log the promotion event
        await supabase
          .from('system_logs')
          .insert({
            tenant_id: agent.tenant_id,
            module: 'agents',
            event: 'agent_promoted',
            context: {
              agent_version_id: agent.id,
              plugin_id: agent.plugin_id,
              version: agent.version,
              xp: agent.xp,
              threshold: XP_PROMOTION_THRESHOLD
            }
          });
        
        promotedCount++;
      } catch (agentError: any) {
        errors.push(`Failed to promote agent ${agent.id}: ${agentError.message}`);
        console.error(`Error promoting agent ${agent.id}:`, agentError);
      }
    }
    
    // Return success response
    return new Response(JSON.stringify({
      success: true,
      promoted_count: promotedCount,
      total_eligible: agentsToPromote?.length || 0,
      errors: errors.length > 0 ? errors : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    // Log error
    console.error("Error in autoEvolveAgents:", error);
    
    // Return error response
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      promoted_count: 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
