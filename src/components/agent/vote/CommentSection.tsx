
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CommentSectionProps } from './types';

const CommentSection: React.FC<CommentSectionProps> = ({
  commentValue,
  setCommentValue,
  onSubmit,
  onCancel,
  disabled
}) => {
  return (
    <div className="mt-4 space-y-3">
      <Textarea
        placeholder="Share your feedback..."
        value={commentValue}
        onChange={(e) => setCommentValue(e.target.value)}
        className="resize-none"
        rows={3}
        disabled={disabled}
      />
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={disabled}
        >
          Cancel
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onSubmit}
          disabled={disabled || !commentValue.trim()}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default CommentSection;
