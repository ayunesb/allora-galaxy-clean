
import { supabase } from '@/integrations/supabase/client';
import { VoteType } from '@/types/fixed';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { VoteResult } from '@/lib/agents/voting/types';

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
    // Insert the vote record
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
      console.error('Error recording vote:', voteError);
      return { 
        success: false, 
        error: `Failed to record vote: ${voteError.message}`,
        upvotes: 0,
        downvotes: 0
      };
    }

    // Update the upvote/downvote count on the agent version
    const updateField = voteType === VoteType.up ? 'upvotes' : 'downvotes';
    
    const { error: updateError } = await supabase
      .from('agent_versions')
      .update({ 
        [updateField]: supabase.rpc('increment', { 
          value: 1
        }),
        xp: supabase.rpc('increment', { 
          value: voteType === VoteType.up ? 10 : -5
        })
      })
      .eq('id', agentVersionId);

    if (updateError) {
      console.error('Error updating agent version counts:', updateError);
      return {
        success: true,
        voteId: voteData.id,
        error: `Vote recorded but failed to update counts: ${updateError.message}`,
        upvotes: 0,
        downvotes: 0
      };
    }

    // Log the event
    await logSystemEvent(
      tenantId,
      'agent',
      'agent_voted',
      {
        agent_version_id: agentVersionId,
        vote_type: voteType,
        vote_id: voteData.id,
        has_comment: !!comment
      }
    ).catch(err => {
      console.warn('Failed to log vote event:', err);
      // Non-critical error, continue execution
    });

    // Fetch the updated counts
    const { data: agentData } = await supabase
      .from('agent_versions')
      .select('upvotes, downvotes')
      .eq('id', agentVersionId)
      .single();

    return {
      success: true,
      voteId: voteData.id,
      upvotes: agentData?.upvotes || 0,
      downvotes: agentData?.downvotes || 0
    };
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
