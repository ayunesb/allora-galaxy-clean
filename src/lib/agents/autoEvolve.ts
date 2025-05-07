
import { supabase } from "@/integrations/supabase/client";
import { logSystemEvent } from "@/lib/system/logSystemEvent";

/**
 * XP threshold for agent promotion
 */
const XP_PROMOTION_THRESHOLD = 1000;

/**
 * Promotes agent versions that have reached the XP threshold
 * @returns Object containing the count of promoted agents and any errors
 */
export async function autoEvolveAgents() {
  try {
    // Get agent versions that have reached the XP threshold but are still in training
    const { data: agentsToPromote, error } = await supabase
      .from('agent_versions')
      .select('id, plugin_id, version, xp')
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
        await logSystemEvent({
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
    
    return {
      success: true,
      promoted_count: promotedCount,
      total_eligible: agentsToPromote?.length || 0,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error: any) {
    console.error("Error in autoEvolveAgents:", error);
    
    // Log the error to system logs
    await logSystemEvent({
      module: 'agents',
      event: 'auto_evolve_error',
      context: {
        error: error.message
      }
    }).catch(logError => console.error("Failed to log error:", logError));
    
    return {
      success: false,
      error: error.message,
      promoted_count: 0
    };
  }
}

/**
 * Checks a single agent for promotion eligibility
 * This can be called after XP updates or votes
 */
export async function checkAgentForPromotion(agentVersionId: string) {
  try {
    // Get the agent version
    const { data: agent, error } = await supabase
      .from('agent_versions')
      .select('id, plugin_id, version, xp, status')
      .eq('id', agentVersionId)
      .single();
      
    if (error || !agent) {
      throw error || new Error('Agent version not found');
    }
    
    // If already active or XP below threshold, nothing to do
    if (agent.status !== 'training' || agent.xp < XP_PROMOTION_THRESHOLD) {
      return {
        success: true,
        promoted: false,
        message: agent.status === 'active' 
          ? 'Agent already active' 
          : `Agent XP (${agent.xp}) below threshold (${XP_PROMOTION_THRESHOLD})`
      };
    }
    
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
    await logSystemEvent({
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
    
    return {
      success: true,
      promoted: true,
      message: `Agent ${agent.id} promoted to active status`
    };
  } catch (error: any) {
    console.error("Error in checkAgentForPromotion:", error);
    return {
      success: false,
      promoted: false,
      error: error.message
    };
  }
}
