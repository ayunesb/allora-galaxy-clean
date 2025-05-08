
import { supabase } from '@/integrations/supabase/client';

/**
 * Retrieves feedback comments for an agent
 * @param agentVersionId The ID of the agent version
 * @returns An array of feedback comments
 */
export async function getFeedbackComments(agentVersionId: string) {
  try {
    const { data, error } = await supabase
      .from('agent_votes')
      .select('comment, vote_type, created_at')
      .eq('agent_version_id', agentVersionId)
      .not('comment', 'is', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching feedback comments:', err);
    return [];
  }
}

/**
 * Evolves a prompt based on feedback comments
 * @param originalPrompt The original prompt text
 * @param comments Array of feedback comments
 * @returns The evolved prompt text
 */
export async function evolvePromptWithFeedback(
  originalPrompt: string, 
  comments: Array<{ comment: string; vote_type: string }>
): Promise<string> {
  // If no comments, return original prompt
  if (!comments || comments.length === 0) {
    return originalPrompt;
  }

  try {
    // Extract relevant feedback
    const positiveComments = comments
      .filter(c => c.vote_type === 'up' && c.comment)
      .map(c => c.comment);
      
    const negativeComments = comments
      .filter(c => c.vote_type === 'down' && c.comment)
      .map(c => c.comment);

    // Simple prompt evolution logic
    // In a real implementation, this might use an AI service to generate a new prompt
    let evolvedPrompt = originalPrompt;
    
    if (positiveComments.length > 0 || negativeComments.length > 0) {
      // Add feedback section to the prompt
      evolvedPrompt += "\n\n# Feedback Incorporated:\n";
      
      if (positiveComments.length > 0) {
        evolvedPrompt += "\n## Positive Aspects to Maintain:\n";
        positiveComments.forEach(comment => {
          evolvedPrompt += `- ${comment}\n`;
        });
      }
      
      if (negativeComments.length > 0) {
        evolvedPrompt += "\n## Areas to Improve:\n";
        negativeComments.forEach(comment => {
          evolvedPrompt += `- ${comment}\n`;
        });
      }
    }
    
    return evolvedPrompt;
  } catch (error) {
    console.error("Error evolving prompt with feedback:", error);
    return originalPrompt;
  }
}
