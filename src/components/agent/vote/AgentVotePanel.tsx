
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAgentVote } from './useAgentVote';
import { VoteButton } from './VoteButton';
import { VoteType } from '@/types/shared';
import { CommentSection } from './CommentSection';

interface AgentVotePanelProps {
  agentVersionId: string;
}

export const AgentVotePanel = ({ agentVersionId }: AgentVotePanelProps) => {
  const { isLoading, upvotes, downvotes, userVote, fetchVotes, castVote } = useAgentVote(agentVersionId);

  useEffect(() => {
    fetchVotes();
  }, [fetchVotes]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center gap-4">
          <VoteButton
            type="up"
            count={upvotes}
            active={userVote === 'up'}
            loading={isLoading}
            onClick={() => castVote('up')}
            disabled={isLoading}
          />
          <VoteButton
            type="down"
            count={downvotes}
            active={userVote === 'down'}
            loading={isLoading}
            onClick={() => castVote('down')}
            disabled={isLoading}
          />
        </div>
        
        <Separator className="my-4" />
        
        <CommentSection 
          voteType={userVote}
          onSubmit={(comment: string) => {
            if (userVote) {
              castVote(userVote, comment);
            } else {
              // Default to upvote if no vote yet
              castVote('up', comment);
            }
          }}
          isSubmitting={isLoading}
        />
      </CardContent>
    </Card>
  );
};
