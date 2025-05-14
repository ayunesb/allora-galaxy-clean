
import { supabase } from '@/lib/supabase';

interface VoteParams {
  agentVersionId: string;
  userId: string;
  voteType: 'up' | 'down';
  comment?: string;
}

interface VoteResult {
  success: boolean;
  voteId?: string;
  error?: string;
}

/**
 * Records a vote on an agent version and updates the vote counts
 */
export const voteOnAgentVersion = async ({
  agentVersionId,
  userId,
  voteType,
  comment
}: VoteParams): Promise<VoteResult> => {
  try {
    // Insert the vote
    const { data: voteData, error: voteError } = await supabase
      .from('agent_votes')
      .insert({
        agent_version_id: agentVersionId,
        user_id: userId,
        vote_type: voteType,
        comment: comment
      })
      .select()
      .single();
    
    if (voteError) {
      throw voteError;
    }
    
    // Get current vote counts
    const { data: agentVersion, error: getError } = await supabase
      .from('agent_versions')
      .select('upvotes, downvotes')
      .eq('id', agentVersionId)
      .single();
    
    if (getError) {
      throw getError;
    }
    
    // Calculate new vote counts
    const upvotes = agentVersion.upvotes || 0;
    const downvotes = agentVersion.downvotes || 0;
    
    const newCounts = {
      upvotes: voteType === 'up' ? upvotes + 1 : upvotes,
      downvotes: voteType === 'down' ? downvotes + 1 : downvotes
    };
    
    // Update the agent version with new vote counts
    const { error: updateError } = await supabase
      .from('agent_versions')
      .update(newCounts)
      .eq('id', agentVersionId)
      .single();
    
    if (updateError) {
      throw updateError;
    }
    
    return {
      success: true,
      voteId: voteData.id
    };
  } catch (error: any) {
    console.error('Error recording vote:', error);
    return {
      success: false,
      error: error.message || 'Unknown error recording vote'
    };
  }
};

/**
 * Upvotes an agent version
 */
export const upvoteAgentVersion = async ({
  agentVersionId,
  userId,
  comment
}: Omit<VoteParams, 'voteType'>): Promise<VoteResult> => {
  return voteOnAgentVersion({
    agentVersionId,
    userId,
    voteType: 'up',
    comment
  });
};

/**
 * Downvotes an agent version
 */
export const downvoteAgentVersion = async ({
  agentVersionId,
  userId,
  comment
}: Omit<VoteParams, 'voteType'>): Promise<VoteResult> => {
  return voteOnAgentVersion({
    agentVersionId,
    userId,
    voteType: 'down',
    comment
  });
};

/**
 * Gets a user's vote for an agent version
 */
export const getUserVote = async (
  agentVersionId: string,
  userId: string
): Promise<'up' | 'down' | null> => {
  try {
    const { data, error } = await supabase
      .from('agent_votes')
      .select('vote_type')
      .eq('agent_version_id', agentVersionId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    
    return data ? data.vote_type as 'up' | 'down' : null;
  } catch (error) {
    console.error('Error getting user vote:', error);
    return null;
  }
};

/**
 * Generic castVote function for use in components
 */
export const castVote = async (
  agentVersionId: string,
  voteType: 'up' | 'down',
  comment?: string
): Promise<VoteResult> => {
  try {
    const user = await supabase.auth.getUser();
    
    if (!user || !user.data.user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }
    
    return await voteOnAgentVersion({
      agentVersionId,
      userId: user.data.user.id,
      voteType,
      comment
    });
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error casting vote'
    };
  }
};
