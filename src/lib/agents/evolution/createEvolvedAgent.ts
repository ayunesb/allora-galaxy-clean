
import { supabase } from '@/integrations/supabase/client';
import { getFeedbackComments, evolvePromptWithFeedback } from './getFeedbackComments';

/**
 * Creates an evolved agent version based on feedback and performance
 * 
 * @param agentVersionId - ID of the current agent version
 * @param pluginId - ID of the plugin this agent belongs to
 * @param performance - Performance metrics and evolution data
 * @returns The newly created agent version or null if creation failed
 */
export async function createEvolvedAgent(
  agentVersionId: string,
  pluginId: string,
  performance: {
    shouldEvolve: boolean;
    evolveReason: string | null;
    metrics: { xp: number; upvotes: number; downvotes: number };
  }
) {
  try {
    // Get the current agent version
    const { data: currentAgent, error: fetchError } = await supabase
      .from('agent_versions')
      .select('prompt, version, created_by')
      .eq('id', agentVersionId)
      .single();
      
    if (fetchError || !currentAgent) {
      console.error('Error fetching current agent:', fetchError);
      return null;
    }
    
    // Get feedback comments
    const comments = await getFeedbackComments(agentVersionId);
    
    // Generate new version number (simple increment)
    const currentVersion = currentAgent.version || '1.0';
    const versionParts = currentVersion.split('.');
    const newVersion = `${versionParts[0]}.${parseInt(versionParts[1] || '0') + 1}`;
    
    // Evolve the prompt based on feedback
    const evolvedPrompt = await evolvePromptWithFeedback(
      currentAgent.prompt,
      comments
    );
    
    // Create new agent version
    const { data: newAgent, error: insertError } = await supabase
      .from('agent_versions')
      .insert({
        plugin_id: pluginId,
        prompt: evolvedPrompt,
        version: newVersion,
        status: 'active',
        created_by: currentAgent.created_by,
        upvotes: 0,
        downvotes: 0,
        xp: 0
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating evolved agent:', insertError);
      return null;
    }
    
    return newAgent;
  } catch (error) {
    console.error('Error in createEvolvedAgent:', error);
    return null;
  }
}
