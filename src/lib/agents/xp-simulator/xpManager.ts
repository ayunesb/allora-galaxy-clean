
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/lib/notifications/toast';
import type { XpAccumulationResult } from './types';

/**
 * Updates agent version XP and manages statistics
 */
export async function updateAgentXp(
  agent_version_id: string, 
  xpAmount: number = 0, 
  upvotes: number = 0, 
  downvotes: number = 0
): Promise<{
  previous: { xp: number; upvotes: number; downvotes: number };
  current: { xp: number; upvotes: number; downvotes: number };
} | null> {
  try {
    // Get current agent stats
    const { data: agent, error: agentError } = await supabase
      .from('agent_versions')
      .select('xp, upvotes, downvotes')
      .eq('id', agent_version_id)
      .single();
      
    if (agentError) {
      throw new Error(`Error fetching agent: ${agentError.message}`);
    }
    
    const currentXp = agent?.xp || 0;
    const currentUpvotes = agent?.upvotes || 0;
    const currentDownvotes = agent?.downvotes || 0;
    
    const newXp = currentXp + xpAmount;
    const newUpvotes = currentUpvotes + upvotes;
    const newDownvotes = currentDownvotes + downvotes;
    
    // Update agent XP and votes
    const { error: updateError } = await supabase
      .from('agent_versions')
      .update({
        xp: newXp,
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', agent_version_id);
      
    if (updateError) {
      throw new Error(`Error updating agent XP: ${updateError.message}`);
    }
    
    return {
      previous: { xp: currentXp, upvotes: currentUpvotes, downvotes: currentDownvotes },
      current: { xp: newXp, upvotes: newUpvotes, downvotes: newDownvotes }
    };
  } catch (error: any) {
    console.error('Error updating agent XP:', error);
    
    notify({
      title: "Error updating agent XP",
      description: error.message
    }, { type: 'error' });
    
    return null;
  }
}

/**
 * Reset agent XP and votes for testing
 */
export async function resetAgentXp(agent_version_id: string): Promise<boolean> {
  try {
    // Reset XP, upvotes, and downvotes
    const { error: updateError } = await supabase
      .from('agent_versions')
      .update({
        xp: 0,
        upvotes: 0,
        downvotes: 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', agent_version_id);
      
    if (updateError) {
      throw new Error(`Error resetting agent XP: ${updateError.message}`);
    }
    
    notify({
      title: "Agent XP Reset",
      description: `Agent ${agent_version_id} XP and votes have been reset to 0`
    });
    
    return true;
  } catch (error: any) {
    console.error('Error resetting agent XP:', error);
    
    notify({
      title: "Error resetting agent XP",
      description: error.message
    }, { type: 'error' });
    
    return false;
  }
}

/**
 * Check if agent is eligible for promotion/evolution
 */
export async function checkAgentEvolution(
  tenant_id: string
): Promise<any> {
  try {
    const { data, error } = await supabase.functions.invoke(
      'autoEvolveAgents',
      {
        body: {
          tenant_id,
          requires_approval: true
        }
      }
    );
    
    if (error) {
      console.warn('Error checking agent for promotion:', error);
      return { error };
    }
    
    return data;
  } catch (error) {
    console.error('Error checking agent evolution:', error);
    return { error };
  }
}
