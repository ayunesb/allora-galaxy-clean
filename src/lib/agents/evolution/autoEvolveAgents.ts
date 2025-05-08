
import { supabase } from '@/integrations/supabase/client';
import { checkEvolutionNeeded } from './checkEvolutionNeeded';
import { createEvolvedAgent } from './createEvolvedAgent';
import { deactivateOldAgent } from './deactivateOldAgent';
import { getFeedbackComments } from './getFeedbackComments';
import { evolvePromptWithFeedback } from './getFeedbackComments';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

export interface EvolutionOptions {
  minimumExecutions?: number;
  failureRateThreshold?: number;
  staleDays?: number;
  batchSize?: number;
  tenantId?: string;
}

export interface EvolutionResult {
  success: boolean;
  agentsChecked: number;
  agentsEvolved: number;
  errors: string[];
  evolvedAgents: {
    id: string;
    name: string;
    reason: string;
    oldVersionId: string;
  }[];
}

/**
 * Automatically evolves agents based on performance metrics and feedback
 * @param options Evolution options
 * @returns Result of the evolution operation
 */
export async function autoEvolveAgents(options: EvolutionOptions = {}): Promise<EvolutionResult> {
  const {
    minimumExecutions = 10,
    failureRateThreshold = 0.3,
    staleDays = 30,
    batchSize = 10,
    tenantId
  } = options;
  
  const result: EvolutionResult = {
    success: true,
    agentsChecked: 0,
    agentsEvolved: 0,
    errors: [],
    evolvedAgents: []
  };
  
  try {
    // Get the active agent versions to check
    let query = supabase
      .from('agent_versions')
      .select('id, name, agent_id, prompt, tenant_id')
      .eq('status', 'active')
      .order('updated_at', { ascending: true })
      .limit(batchSize);
    
    // Filter by tenant if specified
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }
    
    const { data: agentVersions, error } = await query;
    
    if (error) {
      throw error;
    }
    
    result.agentsChecked = agentVersions?.length || 0;
    
    // Check each agent version for evolution
    for (const agentVersion of agentVersions || []) {
      try {
        // Check if this agent needs evolution
        const evolutionCheck = await checkEvolutionNeeded(
          agentVersion.id,
          { 
            minimumExecutions, 
            failureRateThreshold, 
            staleDays 
          }
        );
        
        // If evolution is needed, evolve the agent
        if (evolutionCheck.needsEvolution) {
          // Get feedback comments for the agent
          const comments = await getFeedbackComments(agentVersion.id);
          
          // Evolve the prompt using feedback
          const evolvedPrompt = await evolvePromptWithFeedback(
            agentVersion.prompt,
            comments
          );
          
          // Create the evolved agent version
          const evolvedAgent = await createEvolvedAgent({
            originalVersionId: agentVersion.id,
            agentId: agentVersion.agent_id,
            prompt: evolvedPrompt,
            reason: evolutionCheck.reason || 'Performance optimization',
            tenantId: agentVersion.tenant_id
          });
          
          // Deactivate the old agent version
          await deactivateOldAgent(agentVersion.id, evolvedAgent.id);
          
          // Log the evolution event
          await logSystemEvent(
            agentVersion.tenant_id,
            'agent',
            'agent_evolved',
            {
              agent_id: agentVersion.agent_id,
              old_version_id: agentVersion.id,
              new_version_id: evolvedAgent.id,
              reason: evolutionCheck.reason
            }
          );
          
          // Add to results
          result.agentsEvolved++;
          result.evolvedAgents.push({
            id: evolvedAgent.id,
            name: agentVersion.name,
            reason: evolutionCheck.reason || 'Performance optimization',
            oldVersionId: agentVersion.id
          });
        }
      } catch (agentError: any) {
        result.errors.push(`Error evolving agent ${agentVersion.id}: ${agentError.message}`);
      }
    }
    
    return result;
    
  } catch (error: any) {
    result.success = false;
    result.errors.push(`Auto evolution error: ${error.message}`);
    return result;
  }
}
