
import { supabase } from "@/integrations/supabase/client";
import { snakeToCamel } from "@/types/fixed";
import { UserVote } from "./types";

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
    
    return {
      hasVoted: !!data,
      vote: data ? snakeToCamel(data) : null,
      agentVersionId,
      userId
    };
  } catch (error: any) {
    console.error('Error checking user vote:', error);
    return {
      hasVoted: false,
      vote: null,
      agentVersionId,
      userId,
      error: error.message
    };
  }
}
