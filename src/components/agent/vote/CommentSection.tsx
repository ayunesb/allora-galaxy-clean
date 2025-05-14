
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CommentSectionProps } from './types';

export const CommentSection: React.FC<CommentSectionProps> = ({
  comment = '',
  setComment = () => {},
  onSubmit = () => {},
  onCancel = () => {},
  disabled = false,
  comments = [],
  agentVersionId,
  userHasVoted,
  voteType,
  isLoading
}) => {
  return (
    <div className="space-y-2">
      <Textarea 
        placeholder="Add a comment about this agent's performance..." 
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="min-h-[80px]"
      />
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          variant="default" 
          size="sm"
          onClick={onSubmit}
          disabled={disabled}
        >
          Submit
        </Button>
      </div>
      
      {/* Display comments if there are any */}
      {comments.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium">Recent Comments</h4>
          <ul className="mt-2 space-y-2">
            {comments.map((comment, index) => (
              <li key={index} className="text-sm bg-muted p-2 rounded">
                {comment.comment || comment.text || "No comment text"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
