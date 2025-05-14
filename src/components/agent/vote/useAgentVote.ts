
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { VoteType } from '@/types/shared';
import { UseAgentVoteProps, UseAgentVoteResult } from './types';
import { toast } from '@/components/ui/use-toast';

export const useAgentVote = ({ agentVersionId }: UseAgentVoteProps): UseAgentVoteResult => {
  const { user } = useAuth();
  const [vote, setVote] = useState<VoteType | null>(null);
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!agentVersionId || !user) return;
    
    const fetchAgentVoteData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch vote stats first
        const { data: versionData, error: versionError } = await supabase
          .from('agent_versions')
          .select('upvotes, downvotes')
          .eq('id', agentVersionId)
          .single();
        
        if (versionError) throw versionError;
        
        setUpvotes(versionData.upvotes || 0);
        setDownvotes(versionData.downvotes || 0);
        
        // Then fetch user's vote if they are logged in
        if (user?.id) {
          const { data: voteData, error: voteError } = await supabase
            .from('agent_votes')
            .select('vote_type')
            .eq('agent_version_id', agentVersionId)
            .eq('user_id', user.id)
            .single();
          
          if (voteError && voteError.code !== 'PGRST116') {
            // PGRST116 is "no rows returned" which is fine
            throw voteError;
          }
          
          setVote(voteData?.vote_type as VoteType || null);
        }
      } catch (err) {
        console.error('Error fetching vote data:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgentVoteData();
  }, [agentVersionId, user]);

  const castVote = async (voteType: VoteType, comment?: string) => {
    if (!agentVersionId || !user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to vote on agent versions.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Determine vote changes based on current state
      let upvoteChange = 0;
      let downvoteChange = 0;
      
      if (vote === 'up' && voteType !== 'up') {
        upvoteChange = -1;
      } else if (vote !== 'up' && voteType === 'up') {
        upvoteChange = 1;
      }
      
      if (vote === 'down' && voteType !== 'down') {
        downvoteChange = -1;
      } else if (vote !== 'down' && voteType === 'down') {
        downvoteChange = 1;
      }
      
      // First, update the vote counts on the agent version
      const { error: updateError } = await supabase
        .from('agent_versions')
        .update({
          upvotes: upvotes + upvoteChange,
          downvotes: downvotes + downvoteChange,
        })
        .eq('id', agentVersionId);
      
      if (updateError) throw updateError;
      
      // Check if we should remove existing vote
      if (voteType === 'neutral') {
        const { error: deleteError } = await supabase
          .from('agent_votes')
          .delete()
          .eq('agent_version_id', agentVersionId)
          .eq('user_id', user.id);
        
        if (deleteError) throw deleteError;
      } else {
        // Upsert the vote record
        const { error: upsertError } = await supabase
          .from('agent_votes')
          .upsert({
            agent_version_id: agentVersionId,
            user_id: user.id,
            vote_type: voteType,
            ...(comment ? { comment } : {}),
          }, {
            onConflict: 'agent_version_id,user_id',
          });
        
        if (upsertError) throw upsertError;
      }
      
      // Update local state
      setVote(voteType === 'neutral' ? null : voteType);
      setUpvotes(prev => prev + upvoteChange);
      setDownvotes(prev => prev + downvoteChange);
      
      toast({
        title: voteType === 'neutral' 
          ? "Vote removed" 
          : `${voteType === 'up' ? 'Upvoted' : 'Downvoted'} successfully`,
        variant: "default",
      });
      
    } catch (err) {
      console.error('Error casting vote:', err);
      setError(err as Error);
      
      toast({
        title: "Failed to cast vote",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    vote,
    upvotes,
    downvotes,
    hasVoted: !!vote,
    castVote,
    loading,
    error,
  };
};

export default useAgentVote;
