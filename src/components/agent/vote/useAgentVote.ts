
import { useState, useEffect } from 'react';
import { getUserVote, voteOnAgentVersion } from '@/lib/agents/voting/voteOnAgentVersion';
import { VoteType } from '@/types/shared';
import { toast } from '@/components/ui/use-toast';

export function useAgentVote(agentVersionId: string) {
  const [userVote, setUserVote] = useState<VoteType | null>(null);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [downvoteCount, setDownvoteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [recentComments, setRecentComments] = useState<any[]>([]);

  // Load the user's current vote
  useEffect(() => {
    let isMounted = true;
    
    async function fetchUserVote() {
      if (!agentVersionId) return;
      
      setIsLoading(true);
      try {
        const result = await getUserVote(agentVersionId);
        if (isMounted && result.success) {
          if (result.hasVoted && result.vote) {
            setUserVote(result.vote.vote_type as VoteType);
          } else {
            setUserVote(null);
          }
        }
      } catch (error) {
        console.error('Error fetching user vote:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    fetchUserVote();
    
    return () => {
      isMounted = false;
    };
  }, [agentVersionId]);

  // Handle vote submission
  const handleVote = async (voteType: VoteType) => {
    setIsLoading(true);
    try {
      // If user is changing their vote
      if (userVote) {
        // If clicking the same button, remove the vote
        if (userVote === voteType) {
          // Reset vote logic would go here
          setUserVote(null);
          return;
        }
      }
      
      const result = await voteOnAgentVersion(agentVersionId, voteType, comment);
      
      if (result.success) {
        setUserVote(voteType);
        setUpvoteCount(result.upvotes);
        setDownvoteCount(result.downvotes);
        
        // Clear comment after successful vote
        setComment('');
        
        toast({
          title: voteType === 'up' ? "Upvoted!" : "Downvoted!",
          description: "Thank you for your feedback on this agent version.",
        });
      } else {
        toast({
          title: "Vote Failed",
          description: result.error || "There was a problem recording your vote.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      console.error('Error voting on agent:', error);
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
    hasVoted: userVote !== null
  };
}
