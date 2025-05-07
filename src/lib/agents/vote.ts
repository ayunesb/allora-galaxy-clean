import { supabase } from "@/integrations/supabase/client";

export interface AgentVoteInput {
  agent_version_id: string;
  vote_type: 'up' | 'down';
  user_id: string;
  comment?: string;
}

export type VoteResult = {
  success: boolean;
  error?: string;
  upvotes: number;
  downvotes: number;
};

/**
 * Vote on an agent version and return the updated vote counts
 */
export async function voteOnAgentVersion(input: AgentVoteInput): Promise<VoteResult | null> {
  try {
    // Insert the vote
    const { error } = await supabase
      .from('agent_votes')
      .insert([input]);

    if (error) {
      console.error("Error inserting vote:", error);
      return { success: false, error: error.message, upvotes: 0, downvotes: 0 };
    }

    // Update the agent version's vote count
    let updateData = {};
    if (input.vote_type === 'up') {
      updateData = { upvotes: supabase.rpc('increment', { value: 1 }) };
    } else {
      updateData = { downvotes: supabase.rpc('increment', { value: 1 }) };
    }

    const { data, error: updateError } = await supabase
      .from('agent_versions')
      .update(updateData)
      .eq('id', input.agent_version_id)
      .select('upvotes, downvotes')
      .single();

    if (updateError) {
      console.error("Error updating vote count:", updateError);
      return { success: false, error: updateError.message, upvotes: 0, downvotes: 0 };
    }

    return {
      success: true,
      upvotes: data.upvotes,
      downvotes: data.downvotes
    };
  } catch (error) {
    console.error("Unexpected error in voteOnAgentVersion:", error);
    return { success: false, error: error.message, upvotes: 0, downvotes: 0 };
  }
}

export function vote(agentId: string, targetId: string, vote_type: string) {
    // ...existing code...
}
