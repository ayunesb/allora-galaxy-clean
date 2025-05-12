
import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { VoteButton } from './VoteButton';
import { CommentSection } from './CommentSection';
import { useAgentVote } from './useAgentVote';
import { VoteType } from '@/types/shared';

interface AgentVoteProps {
  agentVersionId: string;
  initialUpvotes?: number;
  initialDownvotes?: number;
  userId?: string;
}

const AgentVotePanel: React.FC<AgentVoteProps> = ({
  agentVersionId,
  initialUpvotes = 0,
  initialDownvotes = 0,
  userId
}) => {
  const [upvoteCount, setUpvoteCount] = useState(initialUpvotes);
  const [downvoteCount, setDownvoteCount] = useState(initialDownvotes);

  const {
    userVote,
    comment,
    setComment,
    showComment,
    setShowComment,
    submitting,
    handleVote,
    handleSubmitComment
  } = useAgentVote({ agentVersionId });

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Agent Performance</h3>
            <div className="flex items-center gap-4">
              <VoteButton
                count={upvoteCount}
                isActive={userVote?.voteType === 'upvote'}
                type="up"
                onClick={() => handleVote('upvote')}
                disabled={submitting}
              />
              <VoteButton
                count={downvoteCount}
                isActive={userVote?.voteType === 'downvote'}
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
