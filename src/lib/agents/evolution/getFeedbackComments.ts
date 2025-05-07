
import { supabase } from '@/integrations/supabase/client';

/**
 * Get comment feedback for an agent
 */
export async function getAgentFeedbackComments(agentId: string) {
  try {
    const { data, error } = await supabase
      .from('agent_votes')
      .select('comment, vote_type')
      .eq('agent_version_id', agentId)
      .not('comment', 'is', null);
      
    if (error) throw error;
    
    // Filter out null/empty comments
    return (data || [])
      .filter(item => item.comment && item.comment.trim() !== '')
      .map(item => `${item.vote_type === 'down' ? 'Issue' : 'Good'}: ${item.comment}`);
  } catch (error) {
    console.error('Error getting agent feedback comments:', error);
    return [];
  }
}

/**
 * Evolve a prompt using feedback
 */
export async function evolvePromptWithFeedback(originalPrompt: string, feedback: string[]): Promise<string> {
  // In a real implementation, this would call an LLM to generate an improved prompt
  // For now, just append the feedback to the original prompt
  
  if (feedback.length === 0) {
    return originalPrompt;
  }
  
  const feedbackStr = feedback.join('\n');
  
  // Simplified evolution - in a real system, we would use an LLM for this
  return `${originalPrompt}\n\nFeedback incorporated from previous version:\n${feedbackStr}`;
}
