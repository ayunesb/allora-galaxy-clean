
import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, SendHorizontal } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { VoteType } from '@/types/shared';
import { useAgentVote } from './useAgentVote';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface AgentVotePanelProps {
  agentVersionId: string;
  initialVote?: VoteType | null;
  initialComments?: string;
  className?: string;
}

const AgentVotePanel: React.FC<AgentVotePanelProps> = ({
  agentVersionId,
  initialVote = null,
  initialComments = '',
  className = '',
}) => {
  const {
    voteType,
    comments,
    isSubmitting,
    setVoteType,
    setComments,
    submitVote,
    submitComment,
  } = useAgentVote({
    agentVersionId,
    initialVoteType: initialVote,
    initialComments,
  });

  const [commentMode, setCommentMode] = useState(false);

  const handleVote = async (type: VoteType) => {
    setVoteType(type);
    await submitVote();
  };

  const handleCommentSubmit = async () => {
    if (comments.trim() && !isSubmitting) {
      await submitComment(comments);
      setCommentMode(false);
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleCommentSubmit();
    }
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-md">Rate this agent</CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        {!commentMode ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant={voteType === 'upvote' ? 'default' : 'outline'}
                size="lg"
                className="w-20 h-12"
                onClick={() => handleVote('upvote')}
                disabled={isSubmitting}
              >
                <ThumbsUp className={`h-5 w-5 ${voteType === 'upvote' ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant={voteType === 'downvote' ? 'destructive' : 'outline'}
                size="lg"
                className="w-20 h-12"
                onClick={() => handleVote('downvote')}
                disabled={isSubmitting}
              >
                <ThumbsDown className={`h-5 w-5 ${voteType === 'downvote' ? 'fill-current' : ''}`} />
              </Button>
            </div>
            
            {comments ? (
              <div className="text-sm mt-3">
                <p className="font-semibold text-xs text-muted-foreground">Your feedback:</p>
                <p className="mt-1 text-sm">{comments}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-7 text-xs"
                  onClick={() => setCommentMode(true)}
                >
                  Edit
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setCommentMode(true)}
              >
                Add a comment
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <Textarea
              placeholder="What did you think about this agent's performance?"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              className="resize-none min-h-[100px]"
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Press Ctrl+Enter to submit</span>
            </div>
          </div>
        )}
      </CardContent>
      
      {commentMode && (
        <CardFooter className="flex justify-between pt-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCommentMode(false);
              setComments(initialComments);
            }}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => handleCommentSubmit()}
            disabled={!comments.trim() || isSubmitting}
          >
            <SendHorizontal className="h-4 w-4 mr-1" />
            Send
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default AgentVotePanel;
