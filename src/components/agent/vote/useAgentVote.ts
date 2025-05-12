
import { useState, useCallback, useEffect } from 'react';
import { getUserVote, upvoteAgentVersion, downvoteAgentVersion } from '@/lib/agents/voting';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { VoteType } from '@/types/shared';

interface UseAgentVoteProps {
  agentVersionId: string;
}

export function useAgentVote({ agentVersionId }: UseAgentVoteProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [userVote, setUserVote] = useState<{ voteType: VoteType; comment?: string } | null>(null);
  const [upvotes, setUpvotes] = useState<number>(0);
  const [downvotes, setDownvotes] = useState<number>(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchUserVote = useCallback(async () => {
    if (!user || !agentVersionId) return;
    
    setIsLoading(true);
    try {
      const result = await getUserVote(user.id, agentVersionId);
      if (result.success && result.hasVoted && result.vote) {
        setUserVote(result.vote);
      } else {
        setUserVote(null);
      }
    } catch (error) {
      console.error('Error fetching user vote:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, agentVersionId]);

  const handleVote = useCallback(async (voteType: VoteType, comment?: string) => {
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

    setIsLoading(true);
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
        if (userVote && userVote.voteType === voteType) {
          // User clicked same vote type again, so clear the vote
          setUserVote(null);
        } else {
          // Set or change vote
          setUserVote({ voteType, comment });
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
      setIsLoading(false);
    }
  }, [user, agentVersionId, toast, userVote]);

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
    handleVote,
    fetchUserVote
  };
}
