
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { VoteType } from '@/types/shared';
import { castVote } from '@/lib/agents/voting';

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
          setUserVote(userVoteData.vote_type === 'up' ? 'up' : 'down');
        } else {
          setUserVote(null);
        }
      }
    } catch (error) {
      console.error('Error fetching votes:', error);
      toast({
        title: "Error",
        description: "Could not load voting information",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [agentVersionId]);
  
  // Cast or update vote
  const performVote = useCallback(async (voteType: VoteType, comment?: string) => {
    setIsLoading(true);
    try {
      const { data: userSession } = await supabase.auth.getSession();
      const userId = userSession?.session?.user.id;
      
      if (!userId) {
        toast({
          title: "Error",
          description: "You must be signed in to vote",
          variant: "destructive"
        });
        return false;
      }
      
      // Use the castVote function from our voting utility
      const result = await castVote(agentVersionId, voteType, comment);
      
      if (result.success) {
        setUserVote(voteType);
        await fetchVotes(); // Refresh vote counts
        
        toast({
          title: "Success",
          description: `Your ${voteType === 'up' ? 'upvote' : 'downvote'} was recorded successfully`,
          variant: "success"
        });
        return true;
      } else {
        throw new Error(result.error || 'Failed to cast vote');
      }
    } catch (error: any) {
      console.error('Error casting vote:', error);
      toast({
        title: "Error",
        description: error.message || 'Could not cast your vote',
        variant: "destructive"
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
    castVote: performVote
  };
};
