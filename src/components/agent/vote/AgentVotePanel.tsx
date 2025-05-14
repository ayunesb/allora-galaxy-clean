
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AgentVotePanelProps } from './types';
import { useAgentVote } from './useAgentVote';
import { VoteButton } from './VoteButton';
import { CommentSection } from './CommentSection';

const AgentVotePanel: React.FC<AgentVotePanelProps> = ({
  agentVersionId,
  upvotes: initialUpvotes = 0,
  downvotes: initialDownvotes = 0,
  isReadOnly = false
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
                active={userVote === 'up'}
                type="up"
                onClick={() => handleVote('up')}
                disabled={submitting || isReadOnly}
              />
              <VoteButton
                count={downvotes}
                active={userVote === 'down'}
                type="down"
                onClick={() => handleVote('down')}
                disabled={submitting || isReadOnly}
              />
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowComment(!showComment)}
                disabled={isReadOnly}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {showComment && !isReadOnly && (
            <CommentSection
              comment={comment}
              setComment={setComment}
              onSubmit={handleSubmitComment}
              onCancel={() => setShowComment(false)}
              disabled={submitting}
              comments={[]}
              agentVersionId={agentVersionId}
              userHasVoted={userVote !== null}
              voteType={userVote || undefined}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentVotePanel;
