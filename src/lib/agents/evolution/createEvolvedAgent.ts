
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

export interface EvolutionResult {
  success: boolean;
  newAgentId?: string;
  previousAgentId?: string;
  version?: string;
  error?: string;
}

/**
 * Creates a new evolved agent and marks the old one as inactive
 * 
 * @param tenantId Tenant ID
 * @param pluginId Plugin ID
 * @param oldAgentId Previous agent version ID
 * @param newPrompt Evolved prompt
 * @param metadata Optional metadata
 * @returns Result of the evolution
 */
export async function createEvolvedAgent(
  tenantId: string,
  pluginId: string,
  oldAgentId: string,
  newPrompt: string,
  metadata?: Record<string, any>
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
    
    // 2. Mark old agent as inactive
    await supabase
      .from('agent_versions')
      .update({ 
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', oldAgentId);
    
    // 3. Create new agent version
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
    
    // 4. Log the evolution
    await logSystemEvent('agent', 'agent_evolved', {
      old_agent_id: oldAgentId,
      new_agent_id: data.id,
      plugin_id: pluginId,
      metadata
    }, tenantId);
    
    return {
      success: true,
      newAgentId: data.id,
      previousAgentId: oldAgentId,
      version: nextVersion
    };
  } catch (error: any) {
    console.error('Error creating evolved agent:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
}
