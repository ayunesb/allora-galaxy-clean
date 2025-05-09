
import { supabase } from '@/integrations/supabase/client';

/**
 * Get feedback comments for an agent version
 * @param agentId The agent version ID
 * @returns Array of feedback comments with vote type
 */
export async function getFeedbackComments(agentId: string) {
  const { data, error } = await supabase
    .from('agent_votes')
    .select('comment, vote_type, created_at, user_id')
    .eq('agent_version_id', agentId)
    .not('comment', 'is', null)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching agent feedback:', error);
    throw error;
  }
  
  return data || [];
}
