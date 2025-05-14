
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import VoteButton from './VoteButton';
import CommentSection from './CommentSection';
import { useAgentVote } from './useAgentVote';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { VoteType } from '@/types/shared';

interface AgentVotePanelProps {
  agentVersionId: string;
  title?: string;
  className?: string;
}

const AgentVotePanel: React.FC<AgentVotePanelProps> = ({
  agentVersionId,
  title = 'Agent Feedback',
  className
}) => {
  const {
    userVote,
    voteStats,
    upvote,
    downvote,
    comments,
    addComment,
    isLoading
  } = useAgentVote({ agentVersionId });
  
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!comment.trim()) return;
    
    setIsSubmitting(true);
    const success = await addComment(comment);
    setIsSubmitting(false);
    
    if (success) {
      setComment('');
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center gap-6">
          <VoteButton
            count={voteStats.upvotes}
            isActive={userVote === 'up'}
            type="up"
            onClick={upvote}
          />
          <VoteButton
            count={voteStats.downvotes}
            isActive={userVote === 'down'}
            type="down"
            onClick={downvote}
          />
        </div>
        
        <div className="mt-6">
          <Textarea
            placeholder="Share your feedback about this agent version..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px]"
          />
          
          <div className="flex justify-end mt-2">
            <Button
              onClick={handleSubmitComment}
              disabled={!comment.trim() || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </div>
        
        {comments.length > 0 && (
          <CommentSection comments={comments} />
        )}
      </CardContent>
    </Card>
  );
};

export default AgentVotePanel;
