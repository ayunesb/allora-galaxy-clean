
import { supabase } from '@/lib/supabase';

/**
 * Check if an agent needs evolution based on various metrics
 * @param agentId The agent version ID to check
 * @returns True if evolution is needed, false otherwise
 */
export async function checkAgentEvolutionNeeded(agentId: string): Promise<boolean> {
  try {
    // Get agent data including votes and logs
    const { data: agent, error } = await supabase
      .from('agent_versions')
      .select('id, created_at, upvotes, downvotes, xp')
      .eq('id', agentId)
      .single();
      
    if (error) {
      console.error('Error fetching agent:', error);
      return false;
    }
    
    // Check if agent is too new (less than 7 days old)
    const createdAt = new Date(agent.created_at).getTime();
    const now = new Date().getTime();
    const ageInDays = (now - createdAt) / (1000 * 60 * 60 * 24);
    
    if (ageInDays < 7) {
      return false; // Agent is too new
    }
    
    // Check vote ratio (if significant number of votes)
    const totalVotes = (agent.upvotes || 0) + (agent.downvotes || 0);
    if (totalVotes >= 10) {
      const downvoteRatio = (agent.downvotes || 0) / totalVotes;
      if (downvoteRatio > 0.3) {
        return true; // More than 30% downvotes, evolution needed
      }
    }
    
    // Check XP accumulation
    if (agent.xp < 100) {
      return false; // Not enough XP accumulated
    }
    
    // Check for execution errors
    const { count: errorCount, error: countError } = await supabase
      .from('execution_logs')
      .select('id', { count: 'exact', head: true })
      .eq('agent_version_id', agentId)
      .eq('status', 'error');
      
    if (!countError && errorCount && errorCount > 5) {
      return true; // Too many errors, evolution needed
    }
    
    // By default, don't evolve
    return false;
  } catch (err) {
    console.error('Error checking if agent needs evolution:', err);
    return false;
  }
}
