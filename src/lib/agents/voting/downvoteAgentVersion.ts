
import voteOnAgentVersion from './voteOnAgentVersion';

/**
 * Helper function to downvote a specific agent version
 * @param userId The user ID
 * @param agentVersionId The agent version ID
 * @param comment Optional comment with the vote
 * @param tenantId Optional tenant ID
 */
export async function downvoteAgentVersion(userId: string, agentVersionId: string, comment?: string, tenantId?: string) {
  return voteOnAgentVersion(userId, agentVersionId, 'downvote', comment, tenantId);
}

export default downvoteAgentVersion;
