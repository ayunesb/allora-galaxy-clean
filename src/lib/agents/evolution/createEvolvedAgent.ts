
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { deactivateAgent } from './deactivateOldAgent';

export interface CreateEvolvedAgentOptions {
  originalVersionId: string;
  agentId: string;
  prompt: string;
  reason: string;
  tenantId: string;
}

export interface EvolutionResult {
  success: boolean;
  id?: string;
  newAgentVersionId?: string;
  error?: string;
}

/**
 * Creates an evolved version of an agent based on feedback
 * 
 * @param options - Options for creating the evolved agent
 * @returns Evolution result with new agent version ID or error
 */
export async function createEvolvedAgent(
  options: CreateEvolvedAgentOptions
): Promise<EvolutionResult> {
  try {
    const { originalVersionId, agentId, prompt, reason, tenantId } = options;
    
    // Insert new agent version
    const { data: newAgentVersion, error: insertError } = await supabase
      .from('agent_versions')
      .insert({
        plugin_id: agentId,
        prompt: prompt,
        created_by: 'system',
        version: `evolved-${new Date().toISOString().split('T')[0]}`,
        previous_version_id: originalVersionId,
        status: 'active',
        evolution_reason: reason,
        tenant_id: tenantId
      })
      .select()
      .single();
    
    if (insertError || !newAgentVersion) {
      throw new Error(`Error creating evolved agent: ${insertError?.message || 'Unknown error'}`);
    }
    
    // Deactivate previous version
    await deactivateAgent(originalVersionId, newAgentVersion.id);
    
    // Log the evolution event
    await logSystemEvent(
      tenantId,
      'agent',
      'agent_evolved',
      {
        previous_agent_id: originalVersionId,
        new_agent_id: newAgentVersion.id,
        reason: reason
      }
    );
    
    return {
      success: true,
      id: newAgentVersion.id,
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
