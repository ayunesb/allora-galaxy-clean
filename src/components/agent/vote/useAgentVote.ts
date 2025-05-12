
import { useState, useCallback, useEffect } from 'react';
import { getUserVote, upvoteAgentVersion, downvoteAgentVersion } from '@/lib/agents/voting';
import { useToast } from '@/hooks/use-toast';
import useAuth from '@/hooks/useAuth';
import { VoteType } from '@/types/shared';

interface UseAgentVoteParams {
  agentVersionId: string;
  initialUpvotes?: number;
  initialDownvotes?: number;
}

export function useAgentVote({ agentVersionId, initialUpvotes = 0, initialDownvotes = 0 }: UseAgentVoteParams) {
  const [isLoading, setIsLoading] = useState(false);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [comment, setComment] = useState<string>('');
  const [showComment, setShowComment] = useState<boolean>(false);
  const [upvotes, setUpvotes] = useState<number>(initialUpvotes);
  const [downvotes, setDownvotes] = useState<number>(initialDownvotes);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchUserVote = useCallback(async () => {
    if (!user || !agentVersionId) return;
    
    setIsLoading(true);
    try {
      const result = await getUserVote(user.id, agentVersionId);
      if (result.success && result.hasVoted && result.vote) {
        setUserVote(result.vote.voteType === 'upvote' ? 'up' : 'down');
        if (result.vote.comment) {
          setComment(result.vote.comment);
        }
      } else {
        setUserVote(null);
      }
    } catch (error) {
      console.error('Error fetching user vote:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, agentVersionId]);

  const handleVote = useCallback(async (voteType: VoteType) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to vote on agent versions.',
        variant: 'destructive',
      });
      return;
    }

    if (!agentVersionId) {
      toast({
        title: 'Error',
        description: 'No agent version specified.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      let result;
      if (voteType === 'upvote') {
        result = await upvoteAgentVersion(user.id, agentVersionId, comment);
      } else {
        result = await downvoteAgentVersion(user.id, agentVersionId, comment);
      }

      if (result.success) {
        setUpvotes(result.upvotes);
        setDownvotes(result.downvotes);
        
        // Update user vote in state
        if (userVote === (voteType === 'upvote' ? 'up' : 'down')) {
          // User clicked same vote type again, so clear the vote
          setUserVote(null);
        } else {
          // Set or change vote
          setUserVote(voteType === 'upvote' ? 'up' : 'down');
        }

        toast({
          title: 'Vote recorded',
          description: `Your ${voteType} has been recorded.`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to record your vote. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  }, [user, agentVersionId, toast, userVote, comment]);

  const handleSubmitComment = useCallback(() => {
    if (userVote) {
      handleVote(userVote === 'up' ? 'upvote' : 'downvote');
    } else if (comment) {
      // If no vote yet but there's a comment, default to upvote
      handleVote('upvote');
    }
    setShowComment(false);
  }, [userVote, comment, handleVote]);

  useEffect(() => {
    if (agentVersionId) {
      fetchUserVote();
    }
  }, [fetchUserVote, agentVersionId]);

  return {
    isLoading,
    userVote,
    upvotes,
    downvotes,
    comment,
    setComment,
    showComment,
    setShowComment,
    submitting,
    handleVote,
    handleSubmitComment,
    fetchUserVote
  };
}

export default useAgentVote;
