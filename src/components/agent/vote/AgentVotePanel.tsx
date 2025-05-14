
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAgentVote } from './useAgentVote';
import VoteButton from './VoteButton';
import CommentSection from './CommentSection';
import { VoteType } from '@/types/voting';

interface AgentVotePanelProps {
  agentVersionId: string;
  title?: string;
  description?: string;
  showComments?: boolean;
  className?: string;
}

const AgentVotePanel: React.FC<AgentVotePanelProps> = ({
  agentVersionId,
  title = 'Was this agent helpful?',
  description = 'Help us improve by rating this agent',
  showComments = true,
  className = '',
}) => {
  const {
    userVote,
    voteStats,
    comments,
    isSubmitting,
    handleUpvote,
    handleDownvote,
    handleCommentSubmit,
  } = useAgentVote(agentVersionId);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center space-x-4 py-4">
          <VoteButton 
            count={voteStats.upvotes} 
            active={userVote?.vote_type === 'up'}
            type="up" 
            onClick={handleUpvote} 
          />
          <VoteButton 
            count={voteStats.downvotes} 
            active={userVote?.vote_type === 'down'}
            type="down" 
            onClick={handleDownvote} 
          />
        </div>
        
        {showComments && (
          <>
            <Separator className="my-4" />
            <div className="space-y-4">
              <h4 className="font-medium">Comments</h4>
              <CommentSection 
                comments={comments}
                onSubmit={handleCommentSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentVotePanel;
