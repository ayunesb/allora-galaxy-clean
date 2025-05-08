
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CommentSectionProps } from './types';

export const CommentSection: React.FC<CommentSectionProps> = ({
  comment,
  setComment,
  onSubmit,
  onCancel,
  disabled
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
    </div>
  );
};
