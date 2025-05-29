import { supabase } from "@/integrations/supabase/client";
import { VoteType } from "@/types/shared";

/**
 * Get the current vote statistics for an agent version
 * @param agentVersionId The ID of the agent version to check
 * @returns Object containing upvotes and downvotes count
 */
export async function getVoteStats(agentVersionId: string) {
  try {
    // Get counts directly from the agent_versions table
    const { data, error } = await supabase
      .from("agent_versions")
      .select("upvotes, downvotes")
      .eq("id", agentVersionId)
      .single();

    if (error) {
      throw error;
    }

    return {
      upvotes: data?.upvotes || 0,
      downvotes: data?.downvotes || 0,
    };
  } catch (error) {
    console.error("Error fetching vote stats:", error);
    return {
      upvotes: 0,
      downvotes: 0,
    };
  }
}

/**
 * Get information about a user's vote on an agent version
 * @param agentVersionId The ID of the agent version to check
 * @param userId The ID of the user
 * @returns Object indicating if the user has voted and the vote details
 */
export async function getUserVoteInfo(agentVersionId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from("agent_votes")
      .select("vote_type, comment")
      .eq("agent_version_id", agentVersionId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No vote found for this user
        return {
          hasVoted: false,
          vote: null,
        };
      }
      throw error;
    }

    return {
      hasVoted: true,
      vote: {
        voteType: data.vote_type as VoteType,
        comment: data.comment,
      },
    };
  } catch (error) {
    console.error("Error fetching user vote info:", error);
    return {
      hasVoted: false,
      vote: null,
    };
  }
}
