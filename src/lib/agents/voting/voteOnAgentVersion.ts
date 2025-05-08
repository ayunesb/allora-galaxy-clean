
import { supabase } from '@/integrations/supabase/client';
import { VoteType } from '@/types/shared';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Vote on an agent version
 * @param agentVersionId The agent version id
 * @param userId The user id
 * @param voteType The vote type (upvote, downvote, neutral)
 * @param comment Optional comment for the vote
 * @param tenantId Tenant ID for scoping
 * @returns Object with success status and message
 */
export async function voteOnAgentVersion(
  agentVersionId: string,
  userId: string,
  voteType: VoteType,
  comment?: string,
  tenantId?: string
) {
  try {
    // Check if agent version exists
    const { data: agentVersion, error: agentVersionError } = await supabase
      .from('agent_versions')
      .select('id, plugin_id, version, tenant_id')
      .eq('id', agentVersionId)
      .single();
      
    if (agentVersionError || !agentVersion) {
      throw new Error(agentVersionError?.message || 'Agent version not found');
    }
    
    // Use tenant ID from agent version if not provided
    const effectiveTenantId = tenantId || agentVersion.tenant_id;
    if (!effectiveTenantId) {
      throw new Error('Tenant ID is required');
    }
    
    // Check if user has already voted on this agent version
    const { data: existingVote, error: existingVoteError } = await supabase
      .from('agent_votes')
      .select('*')
      .eq('agent_version_id', agentVersionId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (existingVoteError) {
      throw new Error(`Error checking existing vote: ${existingVoteError.message}`);
    }
    
    // If vote exists, update it; otherwise, insert new vote
    let result;
    if (existingVote) {
      // Update existing vote
      const { data, error } = await supabase
        .from('agent_votes')
        .update({
          vote_type: voteType,
          comment: comment || existingVote.comment
        })
        .eq('id', existingVote.id)
        .select();
        
      if (error) {
        throw new Error(`Failed to update vote: ${error.message}`);
      }
      result = data;
    } else {
      // Insert new vote
      const { data, error } = await supabase
        .from('agent_votes')
        .insert({
          agent_version_id: agentVersionId,
          user_id: userId,
          vote_type: voteType,
          comment
        })
        .select();
        
      if (error) {
        throw new Error(`Failed to create vote: ${error.message}`);
      }
      result = data;
    }
    
    // Update agent version vote counts
    await updateAgentVersionVoteCounts(agentVersionId);
    
    // Log the vote action
    await logSystemEvent(
      'agent',
      'info',
      {
        action: 'vote',
        agent_version_id: agentVersionId,
        vote_type: voteType,
        has_comment: !!comment
      },
      effectiveTenantId
    );
    
    return {
      success: true,
      message: 'Vote recorded successfully',
      data: result
    };
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error recording vote:', errorMessage);
    
    return {
      success: false,
      message: errorMessage,
      data: null
    };
  }
}

/**
 * Update vote counts on the agent version
 */
async function updateAgentVersionVoteCounts(agentVersionId: string) {
  // Count upvotes
  const { data: upvotes, error: upvotesError } = await supabase
    .from('agent_votes')
    .select('id')
    .eq('agent_version_id', agentVersionId)
    .eq('vote_type', 'upvote');
    
  if (upvotesError) {
    console.error('Error counting upvotes:', upvotesError);
    return;
  }
  
  // Count downvotes
  const { data: downvotes, error: downvotesError } = await supabase
    .from('agent_votes')
    .select('id')
    .eq('agent_version_id', agentVersionId)
    .eq('vote_type', 'downvote');
    
  if (downvotesError) {
    console.error('Error counting downvotes:', downvotesError);
    return;
  }
  
  // Update agent version with vote counts
  const { error: updateError } = await supabase
    .from('agent_versions')
    .update({
      upvotes: upvotes ? upvotes.length : 0,
      downvotes: downvotes ? downvotes.length : 0
    })
    .eq('id', agentVersionId);
    
  if (updateError) {
    console.error('Error updating agent version vote counts:', updateError);
  }
}
