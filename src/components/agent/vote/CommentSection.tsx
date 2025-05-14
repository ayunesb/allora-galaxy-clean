
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CommentSectionProps, Comment } from './types';
import { format } from 'date-fns';

const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  onSubmitComment,
  isSubmitting = false
}) => {
  const [commentValue, setCommentValue] = useState('');

  const handleSubmit = async () => {
    if (onSubmitComment && commentValue.trim()) {
      await onSubmitComment(commentValue);
      setCommentValue('');
    }
  };

  const handleCancel = () => {
    setCommentValue('');
  };

  return (
    <div className="space-y-4">
      {onSubmitComment && (
        <div className="space-y-3">
          <Textarea
            placeholder="Share your feedback..."
            value={commentValue}
            onChange={(e) => setCommentValue(e.target.value)}
            className="resize-none"
            rows={3}
            disabled={isSubmitting}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting || !commentValue.trim()}
            >
              Submit
            </Button>
          </div>
        </div>
      )}

      {comments.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Comments</h3>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="p-3 bg-secondary/30 rounded-md">
                <div className="flex justify-between items-start">
                  <p className="text-sm">{comment.comment}</p>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(comment.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      )}
    </div>
  );
};

export default CommentSection;
