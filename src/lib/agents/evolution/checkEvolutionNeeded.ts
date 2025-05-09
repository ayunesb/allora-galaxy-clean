
import { supabase } from '@/integrations/supabase/client';

/**
 * Checks if an agent needs evolution based on performance and threshold
 * @param agentId The agent version ID to check
 * @param performanceScore The current performance score (0-1)
 * @param threshold The threshold below which evolution is needed
 * @returns True if evolution is needed, false otherwise
 */
export async function checkEvolutionNeeded(
  agentId: string,
  performanceScore: number,
  threshold: number = 0.7
): Promise<boolean> {
  try {
    // If performance is below threshold, evolution is needed
    if (performanceScore < threshold) {
      return true;
    }
    
    // Check if agent has any negative feedback
    const { data: negativeVotes, error: votesError } = await supabase
      .from('agent_votes')
      .select('count')
      .eq('agent_version_id', agentId)
      .eq('vote_type', 'downvote');
    
    if (votesError) {
      console.error(`Error checking votes for agent ${agentId}:`, votesError);
      return false;
    }
    
    // If there are significant negative votes, evolution may be needed
    const negativeVoteCount = negativeVotes?.[0]?.count || 0;
    if (negativeVoteCount >= 3) {
      return true;
    }
    
    // Get agent creation date to check if it's "stale"
    const { data: agent, error: agentError } = await supabase
      .from('agent_versions')
      .select('created_at')
      .eq('id', agentId)
      .single();
    
    if (agentError) {
      console.error(`Error fetching agent ${agentId}:`, agentError);
      return false;
    }
    
    if (agent) {
      const createdAt = new Date(agent.created_at);
      const now = new Date();
      const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      // If the agent is more than 30 days old and performance is below 0.85, evolution is needed
      if (daysSinceCreation > 30 && performanceScore < 0.85) {
        return true;
      }
    }
    
    // No need for evolution
    return false;
  } catch (err) {
    console.error(`Error checking if evolution is needed for agent ${agentId}:`, err);
    return false;
  }
}
