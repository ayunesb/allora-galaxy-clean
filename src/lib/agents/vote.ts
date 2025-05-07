
import { supabase } from "@/integrations/supabase/client";

interface VoteResult {
  success: boolean;
  upvotes: number;
  downvotes: number;
  message?: string;
  error?: string;
}

export async function voteOnAgentVersion(
  agent_version_id: string, 
  vote_type: 'up' | 'down', 
  user_id: string,
  comment?: string
): Promise<VoteResult> {
  try {
    // Insert the vote
    const { error } = await supabase
      .from('agent_votes')
      .insert({
        agent_version_id,
        user_id,
        vote_type,
        comment: comment || null
      });
      
    if (error) {
      throw error;
    }
    
    // Get updated vote counts
    const { data: agentVersion, error: countError } = await supabase
      .from('agent_versions')
      .select('upvotes, downvotes')
      .eq('id', agent_version_id)
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
