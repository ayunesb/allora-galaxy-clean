
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { VoteType } from '@/types/shared';
import { AgentVote } from '@/types/agent';

export interface AgentVotePanelProps {
  agentVersionId: string;
  currentVote?: AgentVote | null;
  upvotes: number;
  downvotes: number;
  onVote: (voteType: VoteType) => void;
  isLoading?: boolean;
  showCount?: boolean;
}

const AgentVotePanel: React.FC<AgentVotePanelProps> = ({
  agentVersionId,
  currentVote,
  upvotes = 0,
  downvotes = 0,
  onVote,
  isLoading = false,
  showCount = true
}) => {
  const handleUpvote = () => {
    onVote('upvote');
  };

  const handleDownvote = () => {
    onVote('downvote');
  };

  return (
    <Card>
      <CardHeader className="py-3">
        <h3 className="text-sm font-medium">Agent Feedback</h3>
      </CardHeader>
      <CardContent className="py-2">
        <div className="flex items-center justify-between">
          <Button
            variant={currentVote?.vote_type === 'upvote' ? 'default' : 'outline'}
            size="sm"
            onClick={handleUpvote}
            disabled={isLoading}
            className="flex-1 mr-2"
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            {showCount && <span>{upvotes}</span>}
          </Button>
          
          <Button
            variant={currentVote?.vote_type === 'downvote' ? 'destructive' : 'outline'}
            size="sm"
            onClick={handleDownvote}
            disabled={isLoading}
            className="flex-1"
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
            {showCount && <span>{downvotes}</span>}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-2">
        <p className="text-xs text-muted-foreground text-center w-full">
          Your feedback helps improve agent performance
        </p>
      </CardFooter>
    </Card>
  );
};

export default AgentVotePanel;
