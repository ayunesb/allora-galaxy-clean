
import { supabase } from "@/integrations/supabase/client";
import { logSystemEvent } from "@/lib/system/logSystemEvent";

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
 * Find agents that might be eligible for promotion based on XP and votes
 * @param tenant_id - The tenant ID to check for
 * @param min_xp_threshold - Minimum XP required (default 1000)
 * @param min_upvotes - Minimum upvotes required (default 5)
 * @returns Array of potentially eligible agent versions
 */
export async function findEligibleAgentsForPromotion(
  tenant_id: string,
  min_xp_threshold: number = 1000,
  min_upvotes: number = 5
) {
  try {
    const { data: agents, error } = await supabase
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
          id,
          tenant_id
        )
      `)
      .eq('status', 'training')
      .gte('xp', min_xp_threshold)
      .gte('upvotes', min_upvotes);
      
    if (error) {
      await logSystemEvent(
        tenant_id,
        'agents',
        'find_eligible_agents_failed',
        { error: error.message }
      );
      throw error;
    }
    
    if (!agents || agents.length === 0) {
      // Log that no eligible agents were found
      await logSystemEvent(
        tenant_id,
        'agents',
        'no_eligible_agents',
        { 
          min_xp_threshold,
          min_upvotes,
          message: 'No agent versions met the promotion criteria' 
        }
      );
      
      return [];
    }
    
    // Filter agents by tenant_id from the plugins relation
    const tenantAgents = agents.filter(agent => 
      agent.plugins?.tenant_id === tenant_id
    );
    
    if (tenantAgents.length === 0) {
      // Log that no eligible agents were found for this specific tenant
      await logSystemEvent(
        tenant_id,
        'agents',
        'no_eligible_tenant_agents',
        { 
          min_xp_threshold,
          min_upvotes,
          message: 'No agent versions for this tenant met the promotion criteria' 
        }
      );
    }
    
    return tenantAgents;
  } catch (error: any) {
    console.error('Error finding eligible agents:', error);
    return [];
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
      await logSystemEvent(
        tenant_id,
        'agents',
        'agent_promotion_check_failed',
        { 
          agent_version_id,
          error: promotionCheck.error || 'Failed to check agent promotion status'
        }
      );
      
      return {
        success: false,
        error: promotionCheck.error || 'Failed to check agent promotion status',
        message: 'Agent not eligible for promotion'
      };
    }

    // If agent doesn't meet criteria, return early
    if (!promotionCheck.ready_for_promotion) {
      await logSystemEvent(
        tenant_id,
        'agents',
        'agent_promotion_criteria_not_met',
        {
          agent_version_id,
          current_xp: promotionCheck.current_xp,
          current_upvotes: promotionCheck.current_upvotes,
          required_xp: min_xp_threshold,
          required_upvotes: min_upvotes
        }
      );
      
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
      await logSystemEvent(
        tenant_id,
        'agents',
        'agent_ready_for_approval',
        {
          agent_version_id,
          plugin_id: promotionCheck.agent.plugin_id,
          plugin_name: promotionCheck.agent.plugins?.name,
          xp: promotionCheck.current_xp,
          upvotes: promotionCheck.current_upvotes
        }
      );
      
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
      await logSystemEvent(
        tenant_id,
        'agents',
        'agent_promotion_update_failed',
        {
          agent_version_id,
          error: updateError.message
        }
      );
      
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
    await logSystemEvent(
      tenant_id,
      'agents',
      'agent_promoted',
      {
        agent_version_id,
        plugin_id: promotionCheck.agent.plugin_id,
        plugin_name: promotionCheck.agent.plugins?.name,
        version: promotionCheck.agent.version,
        xp: promotionCheck.agent.xp,
        threshold: min_xp_threshold
      }
    );

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
      await logSystemEvent(
        tenant_id,
        'agents',
        'agent_promotion_failed',
        {
          agent_version_id,
          error: error.message
        }
      );
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

/**
 * Schedule agent evolution checks for a tenant
 * @param tenant_id The tenant ID to check agents for
 */
export async function scheduleAgentEvolutionCheck(tenant_id: string) {
  try {
    const eligibleAgents = await findEligibleAgentsForPromotion(tenant_id);
    
    if (!eligibleAgents || eligibleAgents.length === 0) {
      // This is the fallback for when no eligible agents exist
      await logSystemEvent(
        tenant_id,
        'agents',
        'no_agents_to_evolve',
        {
          message: 'No agent versions eligible for evolution check'
        }
      );
      return {
        success: true,
        message: 'No agents eligible for evolution',
        eligible_count: 0
      };
    }
    
    // Log that we found eligible agents
    await logSystemEvent(
      tenant_id,
      'agents',
      'agents_eligible_for_evolution',
      {
        count: eligibleAgents.length,
        agent_ids: eligibleAgents.map(a => a.id)
      }
    );
    
    // For each eligible agent, check if it can be promoted (but require approval)
    const results = await Promise.all(
      eligibleAgents.map(agent => 
        checkAndEvolveAgent({
          agent_version_id: agent.id,
          tenant_id,
          requires_approval: true // Always require approval for scheduled checks
        })
      )
    );
    
    const readyForApproval = results.filter(r => r.success && r.needs_approval);
    
    return {
      success: true,
      message: `${readyForApproval.length} agents ready for approval`,
      eligible_count: eligibleAgents.length,
      ready_for_approval: readyForApproval.length,
      agents: readyForApproval.map(r => r.agent)
    };
  } catch (error: any) {
    console.error('Error in scheduleAgentEvolutionCheck:', error);
    
    await logSystemEvent(
      tenant_id,
      'agents',
      'agent_evolution_check_failed',
      {
        error: error.message
      }
    );
    
    return {
      success: false,
      error: error.message,
      message: 'Agent evolution check failed'
    };
  }
}
