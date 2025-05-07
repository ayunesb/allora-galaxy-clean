
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { evolvePromptWithFeedback } from './getFeedbackComments';

/**
 * Create a new evolved agent version
 */
export async function createEvolvedAgent(
  pluginId: string, 
  originalPrompt: string, 
  originalVersion: string,
  comments: string[],
  tenantId: string
) {
  try {
    // Generate new version number
    const versionNum = parseInt(originalVersion.replace('v', ''), 10);
    const newVersion = `v${versionNum + 1}`;
    
    // Generate evolved prompt based on comments
    const evolvedPrompt = await evolvePromptWithFeedback(originalPrompt, comments);
    
    // Insert new agent version
    const { data, error } = await supabase
      .from('agent_versions')
      .insert({
        plugin_id: pluginId,
        prompt: evolvedPrompt,
        version: newVersion,
        status: 'active',
        created_at: new Date().toISOString(),
        upvotes: 0,
        downvotes: 0,
        xp: 0,
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // Log the evolution event
    await logSystemEvent(
      tenantId, 
      'agent',
      'agent_evolved',
      { 
        plugin_id: pluginId, 
        agent_id: data.id,
        version: newVersion
      }
    );
    
    return data;
  } catch (error) {
    console.error('Error creating evolved agent:', error);
    throw error;
  }
}
