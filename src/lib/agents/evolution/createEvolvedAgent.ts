
import { supabase } from '@/integrations/supabase/client';
import { getFeedbackComments } from './getFeedbackComments';
import { evolvePromptWithFeedback } from './evolvePromptWithFeedback';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { deactivateAgent } from './deactivateOldAgent';

export interface EvolutionResult {
  success: boolean;
  newAgentVersionId?: string;
  error?: string;
}

/**
 * Creates an evolved version of an agent based on feedback
 * 
 * @param agentVersionId - ID of the agent version to evolve
 * @param tenantId - ID of the tenant
 * @param evolveReason - Reason for evolving the agent
 * @returns Evolution result with new agent version ID or error
 */
export async function createEvolvedAgent(
  agentVersionId: string,
  tenantId: string,
  evolveReason: string
): Promise<EvolutionResult> {
  try {
    // Get current agent version
    const { data: agentVersion, error: agentError } = await supabase
      .from('agent_versions')
      .select('*')
      .eq('id', agentVersionId)
      .single();

    if (agentError || !agentVersion) {
      throw new Error(`Error fetching agent version: ${agentError?.message || 'Not found'}`);
    }

    // Get feedback comments for improvement
    const comments = await getFeedbackComments(agentVersionId);
    
    // Evolve the prompt based on feedback
    const newPrompt = await evolvePromptWithFeedback(
      agentVersion.prompt,
      comments.map(c => ({ 
        comment: c.comment, 
        vote_type: c.vote_type,
        created_at: c.created_at || new Date().toISOString() 
      })),
      evolveReason
    );
    
    // Create new version (increment version number)
    const currentVersion = parseInt(agentVersion.version.replace('v', ''), 10);
    const newVersion = `v${currentVersion + 1}`;
    
    // Insert new agent version
    const { data: newAgentVersion, error: insertError } = await supabase
      .from('agent_versions')
      .insert({
        plugin_id: agentVersion.plugin_id,
        prompt: newPrompt,
        created_by: 'system',
        version: newVersion,
        previous_version_id: agentVersionId,
        status: 'active',
        evolution_reason: evolveReason,
        tenant_id: tenantId
      })
      .select()
      .single();
    
    if (insertError || !newAgentVersion) {
      throw new Error(`Error creating evolved agent: ${insertError?.message || 'Unknown error'}`);
    }
    
    // Deactivate previous version
    await deactivateAgent(agentVersionId);
    
    // Log the evolution event
    await logSystemEvent(
      tenantId,
      'agent',
      'agent_evolved',
      {
        previous_agent_id: agentVersionId,
        new_agent_id: newAgentVersion.id,
        reason: evolveReason
      }
    );
    
    return {
      success: true,
      newAgentVersionId: newAgentVersion.id
    };
  } catch (error: any) {
    console.error('Error in createEvolvedAgent:', error);
    return {
      success: false,
      error: error.message || 'Failed to create evolved agent'
    };
  }
}
