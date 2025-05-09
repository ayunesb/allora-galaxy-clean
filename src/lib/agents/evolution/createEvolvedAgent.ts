
import { supabase } from '@/integrations/supabase/client';

interface AgentEvolutionInput {
  parentAgentVersionId: string;
  tenantId: string;
  userId: string;
  prompt: string;
  feedbackIncorporated?: string[];
}

interface CreateAgentResult {
  success: boolean;
  agentVersionId?: string;
  error?: string;
}

/**
 * Creates a new evolved version of an agent
 * @param input Evolution input parameters
 * @returns Result of the agent creation operation
 */
export async function createEvolvedAgent(input: AgentEvolutionInput): Promise<CreateAgentResult> {
  try {
    // Get parent agent information
    const { data: parentAgent, error: parentError } = await supabase
      .from('agent_versions')
      .select('plugin_id, version')
      .eq('id', input.parentAgentVersionId)
      .single();
      
    if (parentError) {
      console.error('Error fetching parent agent:', parentError);
      return {
        success: false,
        error: `Failed to fetch parent agent: ${parentError.message}`
      };
    }
    
    // Calculate next version number
    const versionParts = parentAgent.version.split('.').map(Number);
    versionParts[2] += 1; // Increment patch version
    const newVersion = versionParts.join('.');
    
    // Create new agent version
    const { data: newAgent, error: insertError } = await supabase
      .from('agent_versions')
      .insert({
        plugin_id: parentAgent.plugin_id,
        tenant_id: input.tenantId,
        version: newVersion,
        prompt: input.prompt,
        status: 'active',
        created_by: input.userId,
        upvotes: 0,
        downvotes: 0,
        xp: 0
      })
      .select()
      .single();
      
    if (insertError) {
      console.error('Error creating evolved agent:', insertError);
      return {
        success: false,
        error: `Failed to create evolved agent: ${insertError.message}`
      };
    }
    
    // Log the evolution
    await supabase
      .from('system_logs')
      .insert({
        module: 'agent',
        event: 'agent_evolved',
        tenant_id: input.tenantId,
        context: {
          parent_agent_id: input.parentAgentVersionId,
          new_agent_id: newAgent.id,
          feedback_incorporated: input.feedbackIncorporated || [],
          version_from: parentAgent.version,
          version_to: newVersion
        }
      });
    
    return {
      success: true,
      agentVersionId: newAgent.id
    };
  } catch (err: any) {
    console.error('Error in createEvolvedAgent:', err);
    return {
      success: false,
      error: err.message || 'Unknown error creating evolved agent'
    };
  }
}
