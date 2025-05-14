
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
    // recentComments, // Declared but unused
    handleVote,
    // hasVoted, // Declared but unused
  } = useAgentVote({
    agentVersionId,
    initialUpvotes,
    initialDownvotes,
    userId
  });
  
  const handleSubmitComment = async () => {
    setSubmitting(true);
    try {
      // Implementation here
      setShowComment(false);
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 pb-4">
        <div className="flex justify-center space-x-8">
          <VoteButton
            type="up"
            count={upvoteCount}
            active={userVote === 'up'}
            onClick={() => handleVote('up')}
            disabled={isLoading}
          />
          
          <VoteButton
            type="down"
            count={downvoteCount}
            active={userVote === 'down'}
            onClick={() => handleVote('down')}
            disabled={isLoading}
          />
        </div>
        
        {!showComment ? (
          <Button 
            variant="ghost" 
            size="sm"
            className="mt-4 w-full"
            onClick={() => setShowComment(true)}
          >
            Add a comment
          </Button>
        ) : (
          <CommentSection
            comments={[]}
            commentValue={comment}
            setCommentValue={setComment}
            onSubmit={handleSubmitComment}
            onCancel={() => setShowComment(false)}
            disabled={submitting}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AgentVotePanel;
