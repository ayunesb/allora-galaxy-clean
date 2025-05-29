/**
 * Evolves an agent prompt based on feedback and performance metrics
 * @param currentPrompt The current agent prompt
 * @param feedback Array of feedback comments
 * @param performance Performance score of the agent
 * @returns Evolved prompt incorporating feedback
 */
export async function evolvePromptWithFeedback(
  currentPrompt: string,
  feedback: Array<{ comment: string; vote_type: string; created_at: string }>,
  performance: number,
): Promise<string> {
  try {
    // In a real implementation, this would likely use an LLM to improve the prompt
    // For now, we'll implement a simple placeholder that incorporates feedback

    if (!feedback || feedback.length === 0) {
      return currentPrompt; // No feedback to incorporate
    }

    // Extract positive and negative feedback
    const positiveFeedback = feedback
      .filter((f) => f.vote_type === "upvote" && f.comment)
      .map((f) => f.comment);

    const negativeFeedback = feedback
      .filter((f) => f.vote_type === "downvote" && f.comment)
      .map((f) => f.comment);

    // If there's no actionable feedback, return the current prompt
    if (positiveFeedback.length === 0 && negativeFeedback.length === 0) {
      return currentPrompt;
    }

    // Create an evolved prompt with feedback
    let evolvedPrompt = currentPrompt;

    // Add evolved section if it doesn't exist already
    if (!evolvedPrompt.includes("# Evolution Notes")) {
      evolvedPrompt += "\n\n# Evolution Notes\n";
    }

    // Add new evolution entry
    evolvedPrompt += `\n## Evolution Entry (${new Date().toISOString().split("T")[0]}) - Performance Score: ${performance.toFixed(2)}\n`;

    // Add feedback sections
    if (positiveFeedback.length > 0) {
      evolvedPrompt += "\n### Positive Feedback:\n";
      positiveFeedback.forEach((comment) => {
        evolvedPrompt += `- ${comment}\n`;
      });
    }

    if (negativeFeedback.length > 0) {
      evolvedPrompt += "\n### Areas for Improvement:\n";
      negativeFeedback.forEach((comment) => {
        evolvedPrompt += `- ${comment}\n`;
      });
    }

    // Add evolution guidance based on performance
    evolvedPrompt += "\n### Evolution Guidance:\n";

    if (performance < 0.3) {
      evolvedPrompt +=
        "- This prompt needs significant revision due to poor performance\n";
    } else if (performance < 0.7) {
      evolvedPrompt +=
        "- This prompt is performing adequately but could benefit from improvements\n";
    } else {
      evolvedPrompt +=
        "- This prompt is performing well but minor optimizations could still help\n";
    }

    return evolvedPrompt;
  } catch (error) {
    console.error("Error in evolvePromptWithFeedback:", error);
    return currentPrompt; // Return original prompt in case of error
  }
}
