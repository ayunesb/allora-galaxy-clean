
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CommentSectionProps } from './types';

const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  setComments,
  onSubmit,
  onCancel,
  disabled
}) => {
  return (
    <div className="mt-4 space-y-2">
      <Textarea
        placeholder="Add your feedback..."
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        disabled={disabled}
        rows={3}
      />
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onCancel}
          disabled={disabled}
        >
          Cancel
        </Button>
        <Button 
          size="sm" 
          onClick={onSubmit}
          disabled={disabled || !comments.trim()}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default CommentSection;
