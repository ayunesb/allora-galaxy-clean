
import { supabase } from "@/integrations/supabase/client";
import { AgentVote, VoteType } from "@/types/fixed";
import { camelToSnake, snakeToCamel } from "@/types/fixed";

interface VoteResult {
  success: boolean;
  upvotes: number;
  downvotes: number;
  message?: string;
  error?: string;
}

export async function voteOnAgentVersion(
  agentVersionId: string, 
  voteType: VoteType, 
  userId: string,
  comment?: string
): Promise<VoteResult> {
  try {
    // Insert the vote - convert camelCase to snake_case for Supabase
    const { error } = await supabase
      .from('agent_votes')
      .insert(camelToSnake({
        agentVersionId,
        userId,
        voteType,
        comment: comment || null
      }));
      
    if (error) {
      throw error;
    }
    
    // Get updated vote counts
    const { data: agentVersion, error: countError } = await supabase
      .from('agent_versions')
      .select('upvotes, downvotes')
      .eq('id', agentVersionId)
      .single();
      
    if (countError) {
      throw countError;
    }
    
    return {
      success: true,
      upvotes: agentVersion.upvotes || 0,
      downvotes: agentVersion.downvotes || 0,
    };
  } catch (error: any) {
    console.error("Error voting on agent version:", error);
    return {
      success: false,
      upvotes: 0,
      downvotes: 0,
      error: error.message
    };
  }
}
