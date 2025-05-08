
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { voteOnAgentVersion } from '@/lib/agents/vote';
import { getUserVote } from '@/lib/agents/voting';
import { VoteType } from '@/types/shared';
import { useTenantId } from '@/hooks/useTenantId';
import { UseAgentVoteParams, UseAgentVoteReturn } from './types';

export function useAgentVote({
  agentVersionId,
  initialUpvotes = 0,
  initialDownvotes = 0,
  userId
}: UseAgentVoteParams): UseAgentVoteReturn {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const { toast } = useToast();
  const tenantId = useTenantId();
  
  // Fetch the user's current vote when component mounts
  useEffect(() => {
    const fetchUserVote = async () => {
      try {
        if (!userId) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          
          const voteInfo = await getUserVote(agentVersionId, user.id);
          if (voteInfo.hasVoted && voteInfo.vote) {
            if (voteInfo.vote.voteType === 'upvote') {
              setUserVote('up');
            } else if (voteInfo.vote.voteType === 'downvote') {
              setUserVote('down');
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user vote:", error);
      }
    };
    
    fetchUserVote();
  }, [agentVersionId, userId]);

  const handleVote = async (voteType: VoteType) => {
    try {
      setSubmitting(true);
      
      // Get current user ID if not provided
      let voteUserId = userId;
      if (!voteUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: "Authentication required",
            description: "You must be logged in to vote",
            variant: "destructive"
          });
          return;
        }
        voteUserId = user.id;
      }

      // Get tenant ID
      if (!tenantId) {
        toast({
          title: "Error",
          description: "Could not determine tenant ID",
          variant: "destructive"
        });
        return;
      }

      // Convert UI vote type to API vote type
      const apiVoteType = voteType === 'upvote' ? 'upvote' : 
                          voteType === 'downvote' ? 'downvote' : 'neutral';

      // Submit the vote
      const result = await voteOnAgentVersion(
        agentVersionId, 
        apiVoteType, 
        voteUserId, 
        tenantId, 
        comment
      );

      if (result.success) {
        // Update vote counters
        setUpvotes(result.upvotes);
        setDownvotes(result.downvotes);
        
        // Only set userVote if it's upvote or downvote, not neutral
        if (apiVoteType === 'upvote') {
          setUserVote('up');
        } else if (apiVoteType === 'downvote') {
          setUserVote('down');
        } else {
          setUserVote(null);
        }
        
        setShowComment(false);
        setComment('');
        
        toast({
          title: "Vote submitted",
          description: result.message || "Thank you for your feedback!",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to submit your vote",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error submitting vote:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit your vote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitComment = () => {
    if (userVote) {
      const voteType = userVote === 'up' ? 'upvote' : 'downvote';
      handleVote(voteType);
    } else {
      // Default to upvote if no vote yet
      handleVote('upvote');
    }
  };

  return {
    upvotes,
    downvotes,
    userVote,
    comment,
    setComment,
    showComment,
    setShowComment,
    submitting,
    handleVote,
    handleSubmitComment
  };
}
