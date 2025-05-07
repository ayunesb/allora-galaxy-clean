
import { supabase } from "@/integrations/supabase/client";

interface VoteResult {
  upvotes: number;
  downvotes: number;
}

/**
 * Vote on an agent version and return the updated vote counts
 */
export async function voteOnAgentVersion(
  agent_version_id: string,
  vote_type: 'up' | 'down',
  user_id: string,
  comment?: string
): Promise<VoteResult | null> {
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
      console.error("Error inserting vote:", error);
      return null;
    }

    // Update the agent version's vote count
    let updateData = {};
    if (vote_type === 'up') {
      updateData = { upvotes: supabase.rpc('increment', { value: 1 }) };
    } else {
      updateData = { downvotes: supabase.rpc('increment', { value: 1 }) };
    }

    const { data, error: updateError } = await supabase
      .from('agent_versions')
      .update(updateData)
      .eq('id', agent_version_id)
      .select('upvotes, downvotes')
      .single();

    if (updateError) {
      console.error("Error updating vote count:", updateError);
      return null;
    }

    return {
      upvotes: data.upvotes,
      downvotes: data.downvotes
    };
  } catch (error) {
    console.error("Unexpected error in voteOnAgentVersion:", error);
    return null;
  }
}
