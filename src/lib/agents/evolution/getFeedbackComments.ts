
import { supabase } from '@/lib/supabase';

/**
 * Get user feedback comments for an agent version
 * @param agentId The agent version ID
 * @returns Array of feedback comments
 */
export async function getAgentFeedbackComments(agentId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('agent_votes')
      .select('comment, vote_type, created_at, user_id')
      .eq('agent_version_id', agentId)
      .not('comment', 'is', null)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching feedback comments:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Unexpected error fetching feedback comments:', err);
    return [];
  }
}
