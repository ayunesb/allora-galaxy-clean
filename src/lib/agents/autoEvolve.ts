
import { supabase } from "@/integrations/supabase/client";

/**
 * Interface for agent promotion options
 */
interface AgentPromotionOptions {
  agent_version_id: string;
  tenant_id: string;
  min_xp_threshold?: number;
  min_upvotes?: number;
  requires_approval?: boolean;
}

/**
 * Check if an agent version is ready for promotion based on XP and votes
 * @param agent_version_id - The ID of the agent version to check
 * @returns Object with agent data and promotion status
 */
export async function checkAgentForPromotion(agent_version_id: string) {
  try {
    const { data: agent, error } = await supabase
      .from('agent_versions')
      .select(`
        id,
        plugin_id,
        version,
        status,
        xp,
        upvotes,
        downvotes,
        plugins:plugin_id (
          name,
          id
        )
      `)
      .eq('id', agent_version_id)
      .single();

    if (error) {
      throw error;
    }

    if (!agent) {
      return {
        success: false,
        error: 'Agent version not found',
        ready_for_promotion: false
      };
    }

    // Default thresholds - consider moving to env variables or database settings
    const XP_THRESHOLD = 1000;
    const UPVOTES_THRESHOLD = 5;

    const readyForPromotion = 
      agent.status === 'training' && 
      agent.xp >= XP_THRESHOLD && 
      agent.upvotes >= UPVOTES_THRESHOLD;

    return {
      success: true,
      agent,
      ready_for_promotion: readyForPromotion,
      current_xp: agent.xp,
      current_upvotes: agent.upvotes,
      requires_approval: true, // By default require human approval
    };
  } catch (error: any) {
    console.error('Error checking agent promotion status:', error);
    return {
      success: false,
      error: error.message,
      ready_for_promotion: false
    };
  }
}

/**
 * Check and evolve an agent if criteria are met
 * @param options - Options for agent promotion
 * @returns Result object with success status and details
 */
export async function checkAndEvolveAgent(options: AgentPromotionOptions) {
  const {
    agent_version_id,
    tenant_id,
    min_xp_threshold = 1000,
    min_upvotes = 5,
    requires_approval = true
  } = options;

  try {
    // First check if the agent meets promotion criteria
    const promotionCheck = await checkAgentForPromotion(agent_version_id);
    
    if (!promotionCheck.success || !promotionCheck.agent) {
      return {
        success: false,
        error: promotionCheck.error || 'Failed to check agent promotion status',
        message: 'Agent not eligible for promotion'
      };
    }

    // If agent doesn't meet criteria, return early
    if (!promotionCheck.ready_for_promotion) {
      return {
        success: false,
        message: 'Agent does not meet promotion criteria yet',
        current_status: {
          xp: promotionCheck.current_xp,
          upvotes: promotionCheck.current_upvotes,
          required_xp: min_xp_threshold,
          required_upvotes: min_upvotes
        }
      };
    }

    // If requires approval and not explicitly approved in this call, just return ready status
    if (requires_approval) {
      return {
        success: true,
        message: 'Agent is ready for promotion but requires approval',
        agent: promotionCheck.agent,
        ready_for_promotion: true,
        needs_approval: true
      };
    }

    // Perform the actual promotion
    const { error: updateError } = await supabase
      .from('agent_versions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', agent_version_id);

    if (updateError) {
      throw updateError;
    }

    // Find and deprecate any previous active versions
    const { data: activeVersions } = await supabase
      .from('agent_versions')
      .select('id')
      .eq('plugin_id', promotionCheck.agent.plugin_id)
      .eq('status', 'active')
      .neq('id', agent_version_id);

    if (activeVersions && activeVersions.length > 0) {
      const deprecateIds = activeVersions.map(v => v.id);
      
      await supabase
        .from('agent_versions')
        .update({
          status: 'deprecated',
          updated_at: new Date().toISOString()
        })
        .in('id', deprecateIds);
    }

    // Log the promotion event
    await supabase
      .from('system_logs')
      .insert({
        tenant_id: tenant_id,
        module: 'agents',
        event: 'agent_promoted',
        context: {
          agent_version_id,
          plugin_id: promotionCheck.agent.plugin_id,
          plugin_name: promotionCheck.agent.plugins?.name,
          version: promotionCheck.agent.version,
          xp: promotionCheck.agent.xp,
          threshold: min_xp_threshold
        }
      });

    return {
      success: true,
      message: 'Agent successfully promoted to active status',
      agent: promotionCheck.agent,
      deprecated_count: activeVersions?.length || 0
    };
  } catch (error: any) {
    console.error('Error evolving agent:', error);
    
    // Log the failure
    try {
      await supabase
        .from('system_logs')
        .insert({
          tenant_id: tenant_id,
          module: 'agents',
          event: 'agent_promotion_failed',
          context: {
            agent_version_id,
            error: error.message
          }
        });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return {
      success: false,
      error: error.message,
      message: 'Failed to promote agent'
    };
  }
}
