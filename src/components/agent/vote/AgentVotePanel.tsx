
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import VoteButton from './VoteButton';
import CommentSection from './CommentSection';
import { useAgentVote } from './useAgentVote';
import { AgentVoteProps } from './types';
import { VoteType } from '@/types/shared';

const AgentVotePanel: React.FC<AgentVoteProps> = ({ 
  agentVersionId, 
  initialUpvotes, 
  initialDownvotes, 
  userId 
}) => {
  const [showComment, setShowComment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const {
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
  } = useAgentVote(agentVersionId, initialUpvotes, initialDownvotes, userId);

  useEffect(() => {
    checkUserVote();
  }, [checkUserVote]);

  const handleSubmitComment = async () => {
    setSubmitting(true);
    try {
      await handleVote(userVote || 'up');
      setShowComment(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex space-x-4 justify-center">
            <VoteButton 
              count={upvoteCount} 
              active={userVote === 'up' || userVote === 'upvote'} 
              type="up" 
              onClick={() => handleVote('up')} 
              disabled={isLoading} 
            />
            <VoteButton 
              count={downvoteCount} 
              active={userVote === 'down' || userVote === 'downvote'} 
              type="down" 
              onClick={() => handleVote('down')} 
              disabled={isLoading} 
            />
          </div>
          
          {!showComment && (
            <Button 
              variant="outline" 
              onClick={() => setShowComment(true)}
              disabled={isLoading}
              className="mt-2"
            >
              Add Comment
            </Button>
          )}
          
          {showComment && (
            <CommentSection 
              comments={comment} 
              setComments={setComment} 
              onSubmit={handleSubmitComment} 
              onCancel={() => setShowComment(false)} 
              disabled={submitting || isLoading} 
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentVotePanel;
