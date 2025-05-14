
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import useAgentVote from './useAgentVote';
import VoteButton from './VoteButton';
import CommentSection from './CommentSection';
import { Comment } from './types';

interface AgentVotePanelProps {
  agentVersionId: string;
}

const AgentVotePanel: React.FC<AgentVotePanelProps> = ({ agentVersionId }) => {
  const [comment, setComment] = useState('');
  
  const {
    upvotes,
    downvotes,
    userVote,
    comments,
    isSubmitting,
    handleUpvote,
    handleDownvote,
    handleCommentSubmit
  } = useAgentVote({ agentVersionId });

  const handleSubmitComment = async () => {
    if (comment.trim()) {
      await handleCommentSubmit(comment);
      setComment('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-8">
        <VoteButton
          count={upvotes}
          active={userVote === 'up'}
          type="up"
          disabled={isSubmitting}
          onClick={handleUpvote}
        />
        
        <VoteButton
          count={downvotes}
          active={userVote === 'down'}
          type="down"
          disabled={isSubmitting}
          onClick={handleDownvote}
        />
      </div>
      
      <div className="space-y-2">
        <Textarea
          placeholder="Share your thoughts about this agent..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleSubmitComment}
            disabled={!comment.trim() || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </div>
      </div>
      
      <CommentSection
        comments={comments}
        onSubmitComment={handleCommentSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default AgentVotePanel;
