
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { VoteType } from '@/types/shared';
import { VoteResult } from '@/lib/agents/voting/types';
import { castVote } from '@/lib/agents/voting/voteOnAgentVersion';

/**
 * Vote on an agent version (upvote or downvote)
 * @param agentVersionId - The ID of the agent version to vote on
 * @param voteType - The type of vote (up or down)
 * @param userId - The ID of the user casting the vote
 * @param tenantId - The ID of the tenant
 * @param comment - Optional comment with the vote
 * @returns A Promise resolving to the vote result
 */
export async function voteOnAgentVersion(
  agentVersionId: string,
  voteType: VoteType,
  userId: string,
  tenantId: string,
  comment?: string
): Promise<VoteResult> {
  try {
    // Call the castVote function and get the result
    const voteResult = await castVote(agentVersionId, userId, voteType, comment);
    
    // Log to the system log with tenant_id
    if (voteResult.success) {
      await logSystemEvent(
        tenantId,
        'agent',
        'agent_voted',
        {
          agent_version_id: agentVersionId,
          vote_type: voteType,
          vote_id: voteResult.voteId,
          has_comment: !!comment
        }
      ).catch(err => {
        console.warn('Failed to log vote event:', err);
      });
    }
    
    return voteResult;
  } catch (err: any) {
    console.error('Unexpected error during voting:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred while processing your vote',
      upvotes: 0,
      downvotes: 0
    };
  }
}

// Re-export the more specific voting functions with tenant ID wrapper for consistency
export const upvoteAgentVersion = (agentVersionId: string, userId: string, tenantId: string, comment?: string) => 
  voteOnAgentVersion(agentVersionId, 'up', userId, tenantId, comment);

export const downvoteAgentVersion = (agentVersionId: string, userId: string, tenantId: string, comment?: string) => 
  voteOnAgentVersion(agentVersionId, 'down', userId, tenantId, comment);
