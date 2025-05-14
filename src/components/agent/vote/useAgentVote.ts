
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { VoteType } from '@/types/shared';
import { toast } from '@/components/ui/use-toast';

export function useAgentVote(agentVersionId: string, initialUpvotes = 0, initialDownvotes = 0, userId: string) {
  const [upvoteCount, setUpvoteCount] = useState(initialUpvotes);
  const [downvoteCount, setDownvoteCount] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<VoteType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [recentComments, _setRecentComments] = useState<any[]>([]);
  const [hasVoted, setHasVoted] = useState(false);

  // Fetch user's previous vote if any
  const checkUserVote = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('agent_votes')
        .select('*')
        .eq('agent_version_id', agentVersionId)
        .eq('user_id', userId)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking user vote:', error);
        return;
      }
      
      if (data) {
        setUserVote(data.vote_type as VoteType);
        setHasVoted(true);
      }
    } catch (err) {
      console.error('Error in checkUserVote:', err);
    } finally {
      setIsLoading(false);
    }
  }, [agentVersionId, userId]);

  // Handle voting
  const handleVote = async (voteType: VoteType) => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to vote",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Prepare vote data
      const voteData = {
        agent_version_id: agentVersionId,
        user_id: userId,
        vote_type: voteType,
        comment: comment.trim() || null
      };
      
      // Check if user has already voted
      const { data: existingVote, error: checkError } = await supabase
        .from('agent_votes')
        .select('id, vote_type')
        .eq('agent_version_id', agentVersionId)
        .eq('user_id', userId)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking existing vote:', checkError);
        toast({
          title: "Error",
          description: "Failed to check existing vote",
          variant: "destructive"
        });
        return;
      }
      
      let result;
      
      if (existingVote) {
        // User has already voted, update the vote
        if (existingVote.vote_type === voteType) {
          // Same vote type, so remove the vote
          result = await supabase
            .from('agent_votes')
            .delete()
            .eq('id', existingVote.id);
            
          // Update vote counts
          if (voteType === 'up' || voteType === 'upvote') {
            setUpvoteCount(prev => Math.max(0, prev - 1));
          } else {
            setDownvoteCount(prev => Math.max(0, prev - 1));
          }
          
          setUserVote(null);
          setHasVoted(false);
        } else {
          // Different vote type, update it
          result = await supabase
            .from('agent_votes')
            .update({ vote_type: voteType, comment: voteData.comment })
            .eq('id', existingVote.id);
            
          // Update vote counts
          if (voteType === 'up' || voteType === 'upvote') {
            setUpvoteCount(prev => prev + 1);
            setDownvoteCount(prev => Math.max(0, prev - 1));
          } else {
            setUpvoteCount(prev => Math.max(0, prev - 1));
            setDownvoteCount(prev => prev + 1);
          }
          
          setUserVote(voteType);
          setHasVoted(true);
        }
      } else {
        // New vote
        result = await supabase
          .from('agent_votes')
          .insert(voteData);
          
        // Update vote counts
        if (voteType === 'up' || voteType === 'upvote') {
          setUpvoteCount(prev => prev + 1);
        } else {
          setDownvoteCount(prev => prev + 1);
        }
        
        setUserVote(voteType);
        setHasVoted(true);
      }
      
      if (result.error) {
        throw result.error;
      }
      
      // Clear comment after successful vote
      setComment('');
      
      toast({
        title: "Success",
        description: "Your vote has been recorded",
        variant: "default"
      });
      
    } catch (err) {
      console.error('Error in handleVote:', err);
      toast({
        title: "Error",
        description: "Failed to record your vote",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    userVote,
    upvoteCount,
    downvoteCount,
    isLoading,
    comment,
    setComment,
    recentComments,
    handleVote,
    hasVoted,
    checkUserVote
  };
}

export default useAgentVote;
