
import { supabase } from '@/integrations/supabase/client';

/**
 * Get all agents that need evolution based on vote ratios
 */
export async function getAgentsForEvolution(threshold = 0.3) {
  try {
    // Get agents with more downvotes than upvotes by the threshold
    const { data: agentsToEvolve, error } = await supabase
      .from('agent_versions')
      .select('id, plugin_id, prompt, version, upvotes, downvotes')
      .lt('upvotes', supabase.rpc('multiply_value', { value: 'downvotes', multiplier: threshold }))
      .gt('downvotes', 3) // Minimum number of downvotes to consider
      .is('status', 'active')
      .order('downvotes', { ascending: false });
      
    if (error) throw error;
    return agentsToEvolve || [];
  } catch (error) {
    console.error('Error getting agents for evolution:', error);
    return [];
  }
}

/**
 * Get the plugin for a specific agent
 */
export async function getPluginForAgent(agentVersionId: string) {
  try {
    const { data: agent, error } = await supabase
      .from('agent_versions')
      .select('plugin_id')
      .eq('id', agentVersionId)
      .single();
      
    if (error) throw error;
    return agent?.plugin_id;
  } catch (error) {
    console.error('Error getting plugin for agent:', error);
    return null;
  }
}
