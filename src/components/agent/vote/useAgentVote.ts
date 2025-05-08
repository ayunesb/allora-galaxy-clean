
import { useState, useEffect } from 'react';
import { VoteType } from '@/types/shared';
import { castVote, getUserVote } from '@/lib/agents/voting';
import { UseAgentVoteParams, UseAgentVoteReturn } from './types';

export function useAgentVote({
  agentVersionId,
  initialUpvotes = 0,
  initialDownvotes = 0,
  userId
}: UseAgentVoteParams): UseAgentVoteReturn {
  const [upvotes, setUpvotes] = useState<number>(initialUpvotes);
  const [downvotes, setDownvotes] = useState<number>(initialDownvotes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [comment, setComment] = useState<string>('');
  const [showComment, setShowComment] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Fetch the user's current vote when component mounts
  useEffect(() => {
    const fetchUserVote = async () => {
      if (!userId) return;
      
      try {
        const { vote, hasVoted } = await getUserVote(agentVersionId);
        
        if (hasVoted && vote) {
          setUserVote(vote.voteType === 'upvote' ? 'up' : 'down');
          if (vote.comment) {
            setComment(vote.comment);
          }
        }
      } catch (error) {
        console.error('Error fetching user vote:', error);
      }
    };
    
    fetchUserVote();
  }, [agentVersionId, userId]);

  const handleVote = async (voteType: VoteType) => {
    if (!userId || submitting) return;
    
    setSubmitting(true);
    
    try {
      const result = await castVote(agentVersionId, voteType);
      
      if (result.success) {
        setUpvotes(result.upvotes);
        setDownvotes(result.downvotes);
        setUserVote(voteType === 'upvote' ? 'up' : 'down');
        
        // Show comment dialog for new votes or if changing vote type
        if (!userVote || (userVote === 'up' && voteType === 'downvote') || (userVote === 'down' && voteType === 'upvote')) {
          setShowComment(true);
        }
      }
    } catch (error) {
      console.error('Error casting vote:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!userId || submitting || !userVote) return;
    
    setSubmitting(true);
    
    try {
      const voteType = userVote === 'up' ? 'upvote' : 'downvote';
      const result = await castVote(agentVersionId, voteType, comment);
      
      if (result.success) {
        setShowComment(false);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
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
