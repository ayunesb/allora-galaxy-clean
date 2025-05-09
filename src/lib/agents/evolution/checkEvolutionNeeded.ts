
import { supabase } from '@/integrations/supabase/client';

/**
 * Checks if an agent needs evolution based on various metrics
 * @param agentId The agent version ID to check
 * @param performance The current performance score (0-1)
 * @param threshold The threshold performance score below which evolution is needed
 * @returns Boolean indicating whether evolution is needed
 */
export async function checkEvolutionNeeded(
  agentId: string,
  performance: number,
  threshold: number = 0.7
): Promise<boolean> {
  try {
    // Check if performance is below threshold
    if (performance < threshold) {
      return true;
    }
    
    // Check for negative votes
    const { count: downvotes, error: votesError } = await supabase
      .from('agent_votes')
      .select('id', { count: 'exact', head: true })
      .eq('agent_version_id', agentId)
      .eq('vote_type', 'downvote');
      
    if (votesError) {
      console.error('Error checking agent votes:', votesError);
      throw votesError;
    }
    
    // If there are significant downvotes, evolution may be needed
    if (downvotes && downvotes > 3) {
      return true;
    }
    
    // Check last evolution time
    const { data: agent, error: agentError } = await supabase
      .from('agent_versions')
      .select('created_at')
      .eq('id', agentId)
      .single();
      
    if (agentError) {
      console.error('Error checking agent creation date:', agentError);
      throw agentError;
    }
    
    if (agent) {
      const creationDate = new Date(agent.created_at);
      const now = new Date();
      const daysSinceCreation = (now.getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24);
      
      // If the agent is old and hasn't been evolved, it might need an update
      if (daysSinceCreation > 30) {
        return true;
      }
    }
    
    // By default, no evolution needed
    return false;
  } catch (err) {
    console.error('Error in checkEvolutionNeeded:', err);
    return false; // Default to no evolution on error
  }
}
