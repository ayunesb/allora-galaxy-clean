
import { supabase } from '@/lib/supabase';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

type VoteType = 'up' | 'down';

interface AgentVoteResult {
  success: boolean;
  voteId?: string;
  error?: string;
}

/**
 * Vote on an agent version
 * 
 * @param agentVersionId The agent version ID
 * @param voteType 'up' or 'down'
 * @param userId The user ID
 * @param tenantId The tenant ID
 * @param comment Optional comment with feedback
 * @returns Result of the voting operation
 */
export async function voteOnAgentVersion(
  agentVersionId: string,
  voteType: VoteType,
  userId: string,
  tenantId: string,
  comment?: string
): Promise<AgentVoteResult> {
  try {
    // Insert vote
    const { data: voteData, error: voteError } = await supabase
      .from('agent_votes')
      .insert({
        agent_version_id: agentVersionId,
        user_id: userId,
        vote_type: voteType,
        comment
      })
      .select()
      .single();
    
    if (voteError) {
      throw new Error(`Failed to insert vote: ${voteError.message}`);
    }
    
    // Update the agent version's vote counts
    const updateField = voteType === 'up' ? 'upvotes' : 'downvotes';
    
    const { error: updateError } = await supabase
      .from('agent_versions')
      .update({ [updateField]: supabase.rpc(`increment_${updateField}`, { row_id: agentVersionId }) })
      .eq('id', agentVersionId);
    
    if (updateError) {
      throw new Error(`Failed to update ${updateField}: ${updateError.message}`);
    }
    
    // Log the voting action
    await logSystemEvent(
      tenantId,
      'agent',
      'agent_voted',
      {
        agent_version_id: agentVersionId,
        vote_type: voteType,
        user_id: userId,
        comment: comment || null
      }
    );
    
    return {
      success: true,
      voteId: voteData.id
    };
    
  } catch (error: any) {
    console.error('Error in voteOnAgentVersion:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default voteOnAgentVersion;
