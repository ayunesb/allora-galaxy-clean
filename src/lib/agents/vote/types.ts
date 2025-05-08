
/**
 * Types for agent voting system
 */

export type VoteType = 'up' | 'down';

export interface AgentVoteResult {
  success: boolean;
  voteId?: string;
  error?: string;
}
