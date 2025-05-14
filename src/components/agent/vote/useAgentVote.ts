
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { VoteType } from '@/lib/agents/voting/types';

export const useAgentVote = (agentVersionId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userVote, setUserVote] = useState<VoteType | null>(null);
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);

  // Fetch current vote counts and user's vote
  const fetchVotes = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get vote counts
      const { data: voteStats, error: statsError } = await supabase
        .from('agent_versions')
        .select('upvotes, downvotes')
        .eq('id', agentVersionId)
        .single();
      
      if (statsError) throw statsError;
      
      if (voteStats) {
        setUpvotes(voteStats.upvotes || 0);
        setDownvotes(voteStats.downvotes || 0);
      }
      
      // Get user's existing vote
      const { data: userSession } = await supabase.auth.getSession();
      const userId = userSession?.session?.user.id;
      
      if (userId) {
        const { data: userVoteData, error: voteError } = await supabase
          .from('agent_votes')
          .select('vote_type')
          .eq('agent_version_id', agentVersionId)
          .eq('user_id', userId)
          .maybeSingle();
        
        if (voteError) throw voteError;
        
        if (userVoteData) {
          setUserVote(userVoteData.vote_type === 'up' ? VoteType.UP : VoteType.DOWN);
        } else {
          setUserVote(null);
        }
      }
    } catch (error) {
      console.error('Error fetching votes:', error);
      toast({
        title: 'Error fetching votes',
        description: 'Could not load voting information',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [agentVersionId]);
  
  // Cast or update vote
  const castVote = useCallback(async (voteType: VoteType, comment?: string) => {
    setIsLoading(true);
    try {
      const { data: userSession } = await supabase.auth.getSession();
      const userId = userSession?.session?.user.id;
      
      if (!userId) {
        toast({
          title: 'Authentication required',
          description: 'You must be signed in to vote',
          variant: 'destructive',
        });
        return false;
      }
      
      // Call the upvoteAgentVersion or downvoteAgentVersion function based on the vote type
      const voteFunction = voteType === VoteType.UP ? 'upvoteAgentVersion' : 'downvoteAgentVersion';
      
      const { data, error } = await supabase.functions.invoke(voteFunction, {
        body: { 
          agent_version_id: agentVersionId,
          user_id: userId,
          comment 
        }
      });
      
      if (error) throw error;
      
      // Update local state based on vote result
      if (data && data.success) {
        setUserVote(voteType);
        fetchVotes(); // Refresh vote counts
        
        toast({
          title: 'Vote recorded',
          description: `Your ${voteType === VoteType.UP ? 'upvote' : 'downvote'} was recorded successfully`,
        });
        return true;
      }
    } catch (error: any) {
      console.error('Error casting vote:', error);
      toast({
        title: 'Error recording vote',
        description: error.message || 'Could not cast your vote',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
    return false;
  }, [agentVersionId, fetchVotes]);
  
  return {
    isLoading,
    upvotes,
    downvotes,
    userVote,
    fetchVotes,
    castVote
  };
};
