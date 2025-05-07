
import { supabase } from "@/integrations/supabase/client";
import { logSystemEvent } from "@/lib/system/logSystemEvent";

/**
 * XP threshold for agent promotion
 */
const XP_PROMOTION_THRESHOLD = 1000;

/**
 * Options for auto evolving agents
 */
export interface AutoEvolveOptions {
  agent_version_id: string;
  tenant_id: string;
  min_xp_threshold?: number;
  min_upvotes?: number;
  notify_users?: boolean;
}

/**
 * Promotes agent versions that have reached the XP threshold
 * @returns Object containing the count of promoted agents and any errors
 */
export async function autoEvolveAgents() {
  try {
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
        await logSystemEvent({
          tenant_id: agent.tenant_id || "system",
          module: 'agents',
          event: 'agent_promoted',
          severity: 'info',
          message: `Agent version ${agent.id} was promoted to active status`,
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
      tenant_id: "system",
      module: 'agents',
      event: 'auto_evolve_error',
      severity: 'error',
      message: `Auto-evolve error: ${error.message}`,
      context: {
        error: error.message
      }
    });
    
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
      .select('id, plugin_id, version, xp, status, tenant_id')
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
      tenant_id: agent.tenant_id || "system",
      module: 'agents',
      event: 'agent_promoted',
      severity: 'info',
      message: `Agent version ${agent.id} was promoted to active status`,
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

/**
 * Checks if an agent should be evolved to the next version
 * @param options Options for checking and evolving the agent
 */
export async function checkAndEvolveAgent(options: AutoEvolveOptions) {
  const {
    agent_version_id,
    tenant_id,
    min_xp_threshold = 500,
    min_upvotes = 10,
    notify_users = false
  } = options;
  
  try {
    // Get the agent version with its plugin
    const { data: agent, error } = await supabase
      .from('agent_versions')
      .select(`
        id, 
        tenant_id, 
        plugin_id, 
        status, 
        version, 
        xp, 
        upvotes, 
        plugins:plugin_id (id, name)
      `)
      .eq('id', agent_version_id)
      .maybeSingle();
      
    if (error || !agent) {
      await logSystemEvent({
        tenant_id: tenant_id || "system",
        module: 'agents',
        event: 'agent_version_not_found',
        severity: 'warning',
        message: `Agent version ${agent_version_id} not found`,
        context: {
          agent_version_id,
          error: error?.message || 'Agent version not found'
        }
      });
      
      return {
        success: false,
        error: error?.message || 'Agent version not found'
      };
    }
    
    // Check if the agent belongs to the specified tenant
    if (agent.tenant_id && agent.tenant_id !== tenant_id) {
      await logSystemEvent({
        tenant_id: tenant_id || "system",
        module: 'agents',
        event: 'agent_version_access_denied',
        severity: 'warning',
        message: `Access to agent version ${agent_version_id} denied for tenant ${tenant_id}`,
        context: {
          agent_version_id,
          tenant_id,
          actual_tenant_id: agent.tenant_id
        }
      });
      
      return {
        success: false,
        error: 'Agent version does not belong to the specified tenant'
      };
    }
    
    // Check if the agent has reached the XP threshold
    if (agent.xp < min_xp_threshold) {
      return {
        success: true,
        evolved: false,
        message: `Agent hasn't reached XP threshold (${agent.xp}/${min_xp_threshold})`
      };
    }
    
    // Check if the agent has enough upvotes
    if (agent.upvotes < min_upvotes) {
      return {
        success: true,
        evolved: false,
        message: `Agent hasn't reached upvote threshold (${agent.upvotes}/${min_upvotes})`
      };
    }
    
    // Check if there's a next version available
    const { data: nextVersions } = await supabase
      .from('agent_versions')
      .select('id, version, status')
      .eq('plugin_id', agent.plugin_id)
      .gt('version', agent.version)
      .order('version', { ascending: true })
      .limit(1);
      
    // If there's a next version, activate it
    if (nextVersions && nextVersions.length > 0) {
      const nextVersion = nextVersions[0];
      
      // Update the next version to active
      const { error: updateError } = await supabase
        .from('agent_versions')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', nextVersion.id);
        
      if (updateError) {
        throw updateError;
      }
      
      // Log the evolution event
      await logSystemEvent({
        tenant_id: tenant_id || "system",
        module: 'agents',
        event: 'agent_evolved',
        severity: 'info',
        message: `Agent evolved from v${agent.version} to v${nextVersion.version}`,
        context: {
          agent_version_id,
          new_version_id: nextVersion.id,
          plugin_id: agent.plugin_id,
          old_version: agent.version,
          new_version: nextVersion.version
        }
      });
      
      return {
        success: true,
        evolved: true,
        message: `Agent evolved from ${agent.version} to ${nextVersion.version}`,
        new_version_id: nextVersion.id
      };
    } else {
      // No next version available, but agent is ready for evolution
      return {
        success: true,
        evolved: false,
        requires_approval: true,
        message: `Agent is ready for evolution but no next version is available`
      };
    }
  } catch (error: any) {
    console.error("Error in checkAndEvolveAgent:", error);
    return {
      success: false,
      evolved: false,
      error: error.message
    };
  }
}
