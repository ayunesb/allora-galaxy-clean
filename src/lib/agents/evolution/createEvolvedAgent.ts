
import { supabase } from '@/integrations/supabase/client';

export interface EvolutionResult {
  id: string;
  version: string;
  previousId: string;
  prompt: string;
  pluginId: string;
}

/**
 * Creates a new evolved version of an agent
 * @param tenantId Tenant ID for the new agent
 * @param pluginId Plugin ID associated with the agent
 * @param oldAgentId Previous agent version ID
 * @param prompt New prompt for the evolved agent
 * @returns Details of the newly created agent
 */
export async function createEvolvedAgent(
  tenantId: string,
  pluginId: string,
  oldAgentId: string,
  newPrompt: string
): Promise<EvolutionResult> {
  try {
    // 1. Get current version number
    const { data: versions } = await supabase
      .from('agent_versions')
      .select('version')
      .eq('plugin_id', pluginId);
    
    // Calculate next version
    let nextVersion = '1.0.0';
    if (versions && versions.length > 0) {
      const highestVersion = versions
        .map(v => v.version)
        .sort((a, b) => {
          const aParts = a.split('.').map(Number);
          const bParts = b.split('.').map(Number);
          for (let i = 0; i < 3; i++) {
            if (aParts[i] !== bParts[i]) return bParts[i] - aParts[i];
          }
          return 0;
        })[0];
        
      const parts = highestVersion.split('.').map(Number);
      parts[2] += 1; // Increment patch version
      nextVersion = parts.join('.');
    }
    
    // 2. Create new agent version
    const { data, error } = await supabase
      .from('agent_versions')
      .insert({
        plugin_id: pluginId,
        version: nextVersion,
        prompt: newPrompt,
        status: 'active',
        tenant_id: tenantId,
        created_by: null, // System-generated
        upvotes: 0,
        downvotes: 0
      })
      .select()
      .single();
      
    if (error) {
      throw error;
    }

    return {
      id: data.id,
      version: data.version,
      previousId: oldAgentId,
      prompt: data.prompt,
      pluginId: data.plugin_id
    };
  } catch (error) {
    console.error('Error creating evolved agent:', error);
    throw error;
  }
}
