
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAgentVote } from './useAgentVote';
import { CommentSection } from './CommentSection';
import type { VoteType } from '@/types/voting';

interface AgentVotePanelProps {
  agentVersionId: string;
  title?: string;
  description?: string;
  prompt?: string;
}

export const AgentVotePanel: React.FC<AgentVotePanelProps> = ({
  agentVersionId,
  title = 'How did this agent perform?',
  description = 'Your feedback helps us improve our agents',
  prompt
}) => {
  const {
    upvotes,
    downvotes,
    userVote,
    loading,
    voteInProgress,
    handleVote,
    handleComment
  } = useAgentVote(agentVersionId);

  const isUpvoted = userVote?.vote_type === 'upvote';
  const isDownvoted = userVote?.vote_type === 'downvote';

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <Button
            variant={isUpvoted ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-2 w-32 justify-center"
            onClick={() => handleVote('upvote' as VoteType)}
            disabled={loading || voteInProgress}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>Upvote ({upvotes})</span>
          </Button>
          
          <Button
            variant={isDownvoted ? "destructive" : "outline"}
            size="sm"
            className="flex items-center gap-2 w-32 justify-center"
            onClick={() => handleVote('downvote' as VoteType)}
            disabled={loading || voteInProgress}
          >
            <ThumbsDown className="h-4 w-4" />
            <span>Downvote ({downvotes})</span>
          </Button>
        </div>
        
        {(isUpvoted || isDownvoted) && (
          <CommentSection 
            prompt={prompt || (isUpvoted 
              ? "What did you like about this agent?" 
              : "What could be improved about this agent?")}
            onSubmit={handleComment}
            existingComment={userVote?.comment}
            loading={voteInProgress}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AgentVotePanel;
