
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Send, X } from 'lucide-react';

interface CommentSectionProps {
  comment: string;
  setComment: (comment: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  disabled: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  comment,
  setComment,
  onSubmit,
  onCancel,
  disabled
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };
  
  return (
    <Card>
      <CardContent className="p-3 pt-3">
        <p className="text-sm font-medium mb-2">Add a comment to your vote</p>
        <Textarea
          placeholder="Share your feedback about this agent version..."
          value={comment}
          onChange={handleChange}
          className="min-h-24 mb-3"
          disabled={disabled}
        />
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={disabled}
          >
            <X className="mr-1 h-3 w-3" />
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onSubmit}
            disabled={disabled || !comment.trim()}
          >
            <Send className="mr-1 h-3 w-3" />
            Submit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
