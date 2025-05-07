
import { supabase } from "@/integrations/supabase/client";
import { VoteType, camelToSnake } from "@/types/fixed";
import { logSystemEvent } from "@/lib/system/logSystemEvent";
import { VoteResult } from "./types";

/**
 * Vote on an agent version with feedback
 * @param agentVersionId Agent version ID to vote on
 * @param voteType Type of vote (up/down)
 * @param userId ID of the user voting
 * @param tenantId Tenant ID for logging
 * @param comment Optional feedback comment
 * @returns Result with updated vote counts
 */
export async function voteOnAgentVersion(
  agentVersionId: string, 
  voteType: VoteType, 
  userId: string,
  tenantId: string,
  comment?: string
): Promise<VoteResult> {
  try {
    // Check if agent version exists
    const { data: agentVersion, error: agentError } = await supabase
      .from('agent_versions')
      .select('id, plugin_id, version, upvotes, downvotes')
      .eq('id', agentVersionId)
      .single();
      
    if (agentError) {
      throw new Error(`Agent version not found: ${agentError.message}`);
    }
    
    // Check for existing votes from this user on this agent
    const { data: existingVote, error: checkError } = await supabase
      .from('agent_votes')
      .select('id, vote_type')
      .eq('agent_version_id', agentVersionId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (checkError) {
      console.warn('Error checking for existing votes:', checkError);
      // Continue despite error
    }
    
    // Handle case where user is changing their vote
    if (existingVote) {
      return handleExistingVote(
        existingVote, 
        voteType, 
        agentVersion, 
        agentVersionId, 
        comment, 
        tenantId
      );
    }
    
    // Insert a new vote
    return handleNewVote(
      agentVersionId, 
      userId, 
      voteType, 
      agentVersion, 
      tenantId, 
      comment
    );
  } catch (error: any) {
    console.error("Error voting on agent version:", error);
    
    // Attempt to log the error
    try {
      await logSystemEvent(
        tenantId,
        'agent',
        'agent_vote_error',
        {
          agent_version_id: agentVersionId,
          vote_type: voteType,
          error: error.message || 'Unknown error'
        }
      );
    } catch (logError) {
      console.warn('Failed to log vote error:', logError);
    }
    
    return {
      success: false,
      upvotes: 0,
      downvotes: 0,
      error: error.message || 'Unknown error while voting'
    };
  }
}

/**
 * Handle updating an existing vote
 */
async function handleExistingVote(
  existingVote: any, 
  voteType: VoteType, 
  agentVersion: any, 
  agentVersionId: string, 
  comment?: string,
  tenantId?: string
): Promise<VoteResult> {
  // If voting the same way again, do nothing
  if (existingVote.vote_type === voteType) {
    return {
      success: true,
      upvotes: agentVersion.upvotes || 0,
      downvotes: agentVersion.downvotes || 0,
      message: `Vote unchanged, already voted ${voteType}`,
      voteId: existingVote.id
    };
  }
  
  // Update the existing vote
  const { error: updateError } = await supabase
    .from('agent_votes')
    .update({
      vote_type: voteType,
      comment: comment || existingVote.comment
    })
    .eq('id', existingVote.id);
    
  if (updateError) {
    throw new Error(`Failed to update vote: ${updateError.message}`);
  }
  
  // Calculate new vote totals
  const newUpvotes = Math.max(0, (agentVersion.upvotes || 0) + 
    (existingVote.vote_type === 'up' ? -1 : 0) + 
    (voteType === 'up' ? 1 : 0));
    
  const newDownvotes = Math.max(0, (agentVersion.downvotes || 0) + 
    (existingVote.vote_type === 'down' ? -1 : 0) + 
    (voteType === 'down' ? 1 : 0));
  
  // Update the agent version counters
  const { error: counterError } = await supabase
    .from('agent_versions')
    .update({
      upvotes: newUpvotes,
      downvotes: newDownvotes
    })
    .eq('id', agentVersionId);
    
  if (counterError) {
    throw new Error(`Failed to update vote counters: ${counterError.message}`);
  }
  
  // Log the event
  if (tenantId) {
    await logSystemEvent(
      tenantId,
      'agent',
      'agent_vote_changed',
      {
        agent_version_id: agentVersionId,
        vote_type: voteType,
        previous_vote: existingVote.vote_type,
        has_feedback: !!comment
      }
    ).catch(err => console.warn('Failed to log vote change:', err));
  }
  
  return {
    success: true,
    upvotes: newUpvotes,
    downvotes: newDownvotes,
    message: `Vote updated from ${existingVote.vote_type} to ${voteType}`,
    voteId: existingVote.id
  };
}

/**
 * Handle creating a new vote
 */
async function handleNewVote(
  agentVersionId: string,
  userId: string,
  voteType: VoteType,
  agentVersion: any,
  tenantId: string,
  comment?: string
): Promise<VoteResult> {
  // Insert a new vote
  const { data: newVote, error } = await supabase
    .from('agent_votes')
    .insert(camelToSnake({
      agentVersionId,
      userId,
      voteType,
      comment: comment || null
    }))
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  // Update agent version vote counters
  const newUpvotes = Math.max(0, (agentVersion.upvotes || 0) + (voteType === 'up' ? 1 : 0));
  const newDownvotes = Math.max(0, (agentVersion.downvotes || 0) + (voteType === 'down' ? 1 : 0));
  
  const { error: counterError } = await supabase
    .from('agent_versions')
    .update({
      upvotes: newUpvotes,
      downvotes: newDownvotes
    })
    .eq('id', agentVersionId);
    
  if (counterError) {
    throw new Error(`Failed to update vote counters: ${counterError.message}`);
  }
  
  // Log the event
  await logSystemEvent(
    tenantId,
    'agent',
    'agent_vote_added',
    {
      agent_version_id: agentVersionId,
      vote_type: voteType,
      has_feedback: !!comment
    }
  ).catch(err => console.warn('Failed to log new vote:', err));
  
  return {
    success: true,
    upvotes: newUpvotes,
    downvotes: newDownvotes,
    message: `Vote recorded: ${voteType}`,
    voteId: newVote.id
  };
}
