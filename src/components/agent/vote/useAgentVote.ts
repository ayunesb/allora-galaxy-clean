
import { useState, useEffect } from 'react';
import { voteOnAgentVersion, getUserVote } from '@/lib/agents/voting';
import { VoteType } from '@/types/shared';
import { toast } from '@/components/ui/use-toast';
import { VoteResult, UserVoteInfo } from './types';

export function useAgentVote(agentVersionId: string) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userVote, setUserVote] = useState<UserVoteInfo | null>(null);
  
  useEffect(() => {
    if (!agentVersionId) return;
    
    const fetchUserVote = async () => {
      setIsLoading(true);
      try {
        const result = await getUserVote(agentVersionId);
        setUserVote(result);
      } catch (error) {
        console.error("Error fetching user vote:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserVote();
  }, [agentVersionId]);
  
  const castVote = async (voteType: VoteType, comment?: string): Promise<VoteResult> => {
    setIsLoading(true);
    try {
      const result = await voteOnAgentVersion(agentVersionId, voteType, comment);
      
      if (result.success) {
        // Update user vote state
        setUserVote({
          success: true,
          hasVoted: true,
          vote: {
            agent_version_id: agentVersionId,
            user_id: 'current-user',
            vote_type: voteType,
            comment,
            id: result.voteId
          }
        });
        
        const voteAction = voteType === VoteType.Up ? 'Upvoted' : 'Downvoted';
        toast({
          title: `${voteAction} successfully`,
          description: "Your feedback helps improve our agents",
        });
      } else {
        toast({
          title: "Vote failed",
          description: result.error || "Unable to register your vote",
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error: any) {
      toast({
        title: "Vote failed",
        description: error.message || "An error occurred while voting",
        variant: "destructive",
      });
      
      return { 
        success: false, 
        error: error.message || "Failed to cast vote"
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  const removeVote = async (): Promise<VoteResult> => {
    if (!userVote?.vote?.id) {
      return { success: false, error: "No existing vote to remove" };
    }
    
    setIsLoading(true);
    try {
      // We use the neutral vote to remove the vote
      const result = await voteOnAgentVersion(agentVersionId, VoteType.Neutral);
      
      if (result.success) {
        // Update user vote state
        setUserVote({
          success: true,
          hasVoted: false,
          vote: null
        });
        
        toast({
          title: "Vote removed",
          description: "Your vote has been removed",
        });
      } else {
        toast({
          title: "Failed to remove vote",
          description: result.error || "Unable to remove your vote",
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error: any) {
      toast({
        title: "Failed to remove vote",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
      
      return { 
        success: false, 
        error: error.message || "Failed to remove vote"
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    userVote: userVote?.vote?.vote_type,
    hasVoted: userVote?.hasVoted || false,
    isLoading,
    castVote,
    removeVote
  };
}
