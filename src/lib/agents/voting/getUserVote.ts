
import { supabase } from "@/integrations/supabase/client";
import { snakeToCamel } from "@/types/fixed";
import { UserVote } from "./types";
import { VoteType } from "@/types/shared";

/**
 * Check if user has already voted on an agent
 * @param agentVersionId Agent version ID
 * @param userId User ID
 * @returns User's existing vote if any
 */
export async function getUserVote(agentVersionId: string, userId: string): Promise<UserVote> {
  try {
    const { data, error } = await supabase
      .from('agent_votes')
      .select('id, vote_type, comment, created_at')
      .eq('agent_version_id', agentVersionId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) throw error;
    
    if (data) {
      return {
        hasVoted: true,
        vote: snakeToCamel(data),
        agentVersionId,
        userId,
        voteType: data.vote_type as VoteType,
        id: data.id,
        comment: data.comment,
        createdAt: data.created_at
      };
    }
    
    return {
      hasVoted: false,
      vote: null,
      agentVersionId,
      userId,
      voteType: 'neutral' as VoteType, // Default to neutral when no vote exists
    };
  } catch (error: any) {
    console.error('Error checking user vote:', error);
    return {
      hasVoted: false,
      vote: null,
      agentVersionId,
      userId,
      error: error.message,
      voteType: 'neutral' as VoteType, // Default to neutral when error occurs
    };
  }
}
