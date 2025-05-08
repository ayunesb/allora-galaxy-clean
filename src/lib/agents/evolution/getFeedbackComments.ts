
import { supabase } from '@/integrations/supabase/client';

/**
 * Gets feedback comments for an agent version
 * @param agentVersionId Agent version ID to get feedback for
 * @returns Array of feedback comments with vote types
 */
export async function getFeedbackComments(
  agentVersionId: string
): Promise<Array<{ comment: string; vote_type: string; created_at: string }>> {
  try {
    const { data, error } = await supabase
      .from('agent_votes')
      .select('comment, vote_type, created_at')
      .not('comment', 'is', null);
    
    if (error) {
      console.error(`Error fetching feedback for agent ${agentVersionId}:`, error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error(`Error fetching feedback:`, err);
    return [];
  }
}

// Re-export for backward compatibility
export { evolvePromptWithFeedback } from './evolvePromptWithFeedback';
