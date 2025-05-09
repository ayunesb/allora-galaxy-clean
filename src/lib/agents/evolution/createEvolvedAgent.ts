
import { supabase } from '@/integrations/supabase/client';

/**
 * Create an evolved version of an agent
 * @param agentId The ID of the agent version to evolve
 * @param tenantId The tenant ID
 * @returns The newly created agent version
 */
export async function createEvolvedAgent(
  agentId: string,
  tenantId: string
): Promise<{ id: string; version: string; prompt: string; success: boolean }> {
  try {
    // Fetch the current agent version
    const { data: currentAgent, error: fetchError } = await supabase
      .from('agent_versions')
      .select('*')
      .eq('id', agentId)
      .single();
      
    if (fetchError) {
      throw new Error(`Failed to fetch agent: ${fetchError.message}`);
    }
    
    // Generate a new version number
    const currentVersionParts = currentAgent.version.split('.');
    const majorVersion = parseInt(currentVersionParts[0]);
    const minorVersion = parseInt(currentVersionParts[1] || '0');
    
    const newVersion = `${majorVersion}.${minorVersion + 1}`;
    
    // In a real implementation, you might call an AI service to evolve the prompt
    // For now, we'll just append some text to simulate evolution
    const evolvedPrompt = `${currentAgent.prompt}\n\n// Evolved with improved understanding based on user feedback and performance metrics.`;
    
    // Insert the new agent version
    const { data: newAgent, error: insertError } = await supabase
      .from('agent_versions')
      .insert({
        plugin_id: currentAgent.plugin_id,
        version: newVersion,
        prompt: evolvedPrompt,
        status: 'active',
        created_by: currentAgent.created_by,
        tenant_id: tenantId
      })
      .select()
      .single();
      
    if (insertError) {
      throw new Error(`Failed to create evolved agent: ${insertError.message}`);
    }
    
    // Log the evolution in system_logs
    await supabase.from('system_logs').insert({
      module: 'agent',
      event: 'evolved',
      context: {
        previous_agent_id: agentId,
        new_agent_id: newAgent.id,
        previous_version: currentAgent.version,
        new_version: newVersion
      },
      tenant_id: tenantId
    });
    
    return {
      id: newAgent.id,
      version: newAgent.version,
      prompt: newAgent.prompt,
      success: true
    };
  } catch (error: any) {
    console.error('Error creating evolved agent:', error);
    throw error;
  }
}
