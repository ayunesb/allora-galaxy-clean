
import { useState, useEffect } from 'react';
import { VoteType } from '@/types/fixed';
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
      try {
        const { vote, hasVoted } = await getUserVote(agentVersionId, userId);
        
        if (hasVoted && vote) {
          setUserVote(vote.vote_type === 'upvote' || vote.vote_type === 'up' ? 'up' : 'down');
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
    if (submitting) return;
    
    setSubmitting(true);
    
    try {
      // Convert UI vote type to API vote type if needed
      const apiVoteType: VoteType = voteType === 'up' ? 'upvote' : 
                                   voteType === 'down' ? 'downvote' : 
                                   voteType;
      
      const result = await castVote(agentVersionId, apiVoteType);
      
      if (result.success) {
        setUpvotes(result.upvotes);
        setDownvotes(result.downvotes);
        
        // Set UI state based on API vote type
        if (apiVoteType === 'upvote' || apiVoteType === 'up') {
          setUserVote('up');
        } else if (apiVoteType === 'downvote' || apiVoteType === 'down') {
          setUserVote('down');
        }
        
        // Show comment dialog for new votes or if changing vote type
        const uiVoteType = apiVoteType === 'upvote' || apiVoteType === 'up' ? 'up' : 'down';
        if (!userVote || (userVote === 'up' && uiVoteType === 'down') || (userVote === 'down' && uiVoteType === 'up')) {
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
    if (!userVote || submitting) return;
    
    setSubmitting(true);
    
    try {
      // Convert UI state to API VoteType
      const apiVoteType: VoteType = userVote === 'up' ? 'upvote' : 'downvote';
      const result = await castVote(agentVersionId, apiVoteType, comment);
      
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
