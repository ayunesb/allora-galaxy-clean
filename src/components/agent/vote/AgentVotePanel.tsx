
import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { VoteButton } from './VoteButton';
import { CommentSection } from './CommentSection';
import { useAgentVote } from './useAgentVote';

interface AgentVoteProps {
  agentVersionId: string;
  initialUpvotes?: number;
  initialDownvotes?: number;
  userId?: string;
}

const AgentVotePanel: React.FC<AgentVoteProps> = ({
  agentVersionId,
  initialUpvotes = 0,
  initialDownvotes = 0
}) => {
  const {
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
  } = useAgentVote({ 
    agentVersionId, 
    initialUpvotes, 
    initialDownvotes 
  });

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Agent Performance</h3>
            <div className="flex items-center gap-4">
              <VoteButton
                count={upvotes}
                isActive={userVote === 'up'}
                type="up"
                onClick={() => handleVote('upvote')}
                disabled={submitting}
              />
              <VoteButton
                count={downvotes}
                isActive={userVote === 'down'}
                type="down"
                onClick={() => handleVote('downvote')}
                disabled={submitting}
              />
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowComment(!showComment)}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {showComment && (
            <CommentSection
              comment={comment}
              setComment={setComment}
              onSubmit={handleSubmitComment}
              onCancel={() => setShowComment(false)}
              disabled={submitting}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentVotePanel;
