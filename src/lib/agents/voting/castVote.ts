
import voteOnAgentVersion from './voteOnAgentVersion';
import type { VoteType } from '@/types/shared';

/**
 * Cast a vote on an agent version
 * @param userId The user ID
 * @param agentVersionId The agent version ID
 * @param voteType The type of vote (upvote or downvote)
 * @param comment Optional comment with the vote
 * @param tenantId Optional tenant ID
 */
export async function castVote(
  userId: string,
  agentVersionId: string,
  voteType: VoteType,
  comment?: string,
  tenantId?: string
) {
  return voteOnAgentVersion(userId, agentVersionId, voteType, comment, tenantId);
}

export default castVote;
