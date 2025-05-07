
import { supabase } from "@/integrations/supabase/client";
import { AgentVote, VoteType } from "@/types/fixed";
import { camelToSnake, snakeToCamel } from "@/types/fixed";
import { logSystemEvent } from "@/lib/system/logSystemEvent";

interface VoteResult {
  success: boolean;
  upvotes: number;
  downvotes: number;
  message?: string;
  error?: string;
  voteId?: string;
}

/**
 * Vote on an agent version with feedback
 * @param agentVersionId Agent version ID to vote on
 * @param voteType Type of vote (up/down)
 * @param userId ID of the user voting
 * @param comment Optional feedback comment
 * @param tenantId Tenant ID for logging
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
      
      // Update the existing vote and adjust counters
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
      const upvoteChange = voteType === 'up' ? 1 : -1;
      const downvoteChange = voteType === 'down' ? 1 : -1;
      
      const newUpvotes = Math.max(0, (agentVersion.upvotes || 0) + (existingVote.vote_type === 'up' ? -1 : 0) + (voteType === 'up' ? 1 : 0));
      const newDownvotes = Math.max(0, (agentVersion.downvotes || 0) + (existingVote.vote_type === 'down' ? -1 : 0) + (voteType === 'down' ? 1 : 0));
      
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
      
      return {
        success: true,
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        message: `Vote updated from ${existingVote.vote_type} to ${voteType}`,
        voteId: existingVote.id
      };
    }
    
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
 * Get vote statistics for an agent version
 * @param agentVersionId Agent version ID
 * @returns Vote statistics
 */
export async function getAgentVoteStats(agentVersionId: string) {
  try {
    const { data: agent, error } = await supabase
      .from('agent_versions')
      .select('upvotes, downvotes, xp')
      .eq('id', agentVersionId)
      .single();
      
    if (error) throw error;
    
    // Get recent comments
    const { data: recentComments, error: commentsError } = await supabase
      .from('agent_votes')
      .select('id, vote_type, comment, created_at')
      .eq('agent_version_id', agentVersionId)
      .not('comment', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (commentsError) {
      console.warn('Error fetching vote comments:', commentsError);
    }
    
    return {
      success: true,
      upvotes: agent.upvotes || 0,
      downvotes: agent.downvotes || 0,
      xp: agent.xp || 0,
      totalVotes: (agent.upvotes || 0) + (agent.downvotes || 0),
      ratio: agent.upvotes && (agent.upvotes + agent.downvotes) > 0 
        ? Math.round((agent.upvotes / (agent.upvotes + agent.downvotes)) * 100)
        : 0,
      recentComments: recentComments || []
    };
  } catch (error: any) {
    console.error('Error getting agent vote stats:', error);
    return {
      success: false,
      upvotes: 0,
      downvotes: 0,
      xp: 0,
      totalVotes: 0,
      ratio: 0,
      error: error.message,
      recentComments: []
    };
  }
}

/**
 * Check if user has already voted on an agent
 * @param agentVersionId Agent version ID
 * @param userId User ID
 * @returns User's existing vote if any
 */
export async function getUserVote(agentVersionId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('agent_votes')
      .select('id, vote_type, comment, created_at')
      .eq('agent_version_id', agentVersionId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) throw error;
    
    return {
      success: true,
      hasVoted: !!data,
      vote: data ? snakeToCamel(data) : null
    };
  } catch (error: any) {
    console.error('Error checking user vote:', error);
    return {
      success: false,
      hasVoted: false,
      vote: null,
      error: error.message
    };
  }
}
