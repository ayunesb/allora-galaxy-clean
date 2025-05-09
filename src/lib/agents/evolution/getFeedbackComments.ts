
import { supabase } from '@/integrations/supabase/client';

/**
 * Get feedback comments for an agent version
 * @param agentId The ID of the agent version
 * @returns Array of feedback comments
 */
export async function getFeedbackComments(agentId: string) {
  try {
    const { data, error } = await supabase
      .from('agent_votes')
      .select('comment, vote_type')
      .eq('agent_version_id', agentId)
      .not('comment', 'is', null);
      
    if (error) {
      console.error('Error fetching agent feedback:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getFeedbackComments:', error);
    return [];
  }
}
