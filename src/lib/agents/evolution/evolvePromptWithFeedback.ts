
/**
 * Evolves a prompt based on feedback and evolution reason
 * 
 * @param currentPrompt - The current prompt to evolve
 * @param feedbackComments - Array of feedback comments with vote types
 * @param evolveReason - Reason for evolving the agent
 * @returns Evolved prompt
 */
export async function evolvePromptWithFeedback(
  currentPrompt: string,
  feedbackComments: Array<{ comment: string; vote_type: string; created_at: string }>,
  evolveReason = 'Regular improvement'
): Promise<string> {
  try {
    // Extract positive and negative feedback
    const positiveFeedback = feedbackComments
      .filter(c => c.vote_type === 'up')
      .map(c => c.comment);
    
    const negativeFeedback = feedbackComments
      .filter(c => c.vote_type === 'down')
      .map(c => c.comment);
    
    // Simple evolution logic - in production this would use AI
    let evolvedPrompt = currentPrompt;
    
    // Add a header with feedback summary
    evolvedPrompt = `# Evolved Agent Prompt v${new Date().toISOString().split('T')[0]}
# Evolution reason: ${evolveReason}
# Based on ${feedbackComments.length} feedback comments (${positiveFeedback.length} positive, ${negativeFeedback.length} negative)

${evolvedPrompt}

# Feedback incorporated:
${positiveFeedback.length > 0 
  ? `## Positive feedback:\n${positiveFeedback.map(f => `- ${f}`).join('\n')}`
  : '## No positive feedback provided'}

${negativeFeedback.length > 0
  ? `## Areas for improvement based on feedback:\n${negativeFeedback.map(f => `- ${f}`).join('\n')}`
  : '## No negative feedback provided'}
`;
    
    return evolvedPrompt;
  } catch (error) {
    console.error('Error evolving prompt with feedback:', error);
    // If evolution fails, return the original prompt
    return currentPrompt;
  }
}
