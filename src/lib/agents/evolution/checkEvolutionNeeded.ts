
/**
 * Check if agent evolution is needed for a specific agent
 */
export async function checkAgentEvolutionNeeded(
  _agentId: string, 
  upvotes: number, 
  downvotes: number,
  threshold = 0.3
) {
  // If no votes yet, no need to evolve
  if (upvotes + downvotes < 3) {
    return false;
  }
  
  const ratio = upvotes / (upvotes + downvotes);
  return ratio < threshold;
}
