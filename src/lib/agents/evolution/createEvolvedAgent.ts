
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

export interface EvolutionInput {
  parentAgentVersionId: string;
  tenantId: string;
  userId: string;
  prompt: string;
  feedbackIncorporated?: string[];
}

export interface EvolutionResult {
  success: boolean;
  agentVersionId?: string;
  error?: string;
}

/**
 * Create a new evolved agent version based on parent
 */
export async function createEvolvedAgent(input: EvolutionInput): Promise<EvolutionResult> {
  try {
    const { parentAgentVersionId, tenantId, userId, prompt, feedbackIncorporated = [] } = input;
    
    // Get the parent agent version
    const { data: parentAgent, error: parentError } = await supabase
      .from('agent_versions')
      .select('plugin_id, version, prompt')
      .eq('id', parentAgentVersionId)
      .single();
      
    if (parentError) {
      throw new Error(`Failed to get parent agent: ${parentError.message}`);
    }
    
    // Generate new version number
    const versionParts = parentAgent.version.split('.');
    const newVersion = `${versionParts[0]}.${Number(versionParts[1]) + 1}.0`;
    
    // Create the new agent version
    const { data: newAgent, error: insertError } = await supabase
      .from('agent_versions')
      .insert({
        plugin_id: parentAgent.plugin_id,
        version: newVersion,
        prompt,
        status: 'active',
        created_by: userId,
        upvotes: 0,
        downvotes: 0,
        xp: 0
      })
      .select('id')
      .single();
      
    if (insertError) {
      throw new Error(`Failed to create evolved agent: ${insertError.message}`);
    }
    
    // Log the agent evolution
    await logSystemEvent('agent', 'info', {
      action: 'evolve',
      parent_agent_id: parentAgentVersionId,
      new_agent_id: newAgent.id,
      user_id: userId,
      feedback_count: feedbackIncorporated.length
    }, tenantId);
    
    return {
      success: true,
      agentVersionId: newAgent.id
    };
  } catch (error: any) {
    console.error('Error creating evolved agent:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
