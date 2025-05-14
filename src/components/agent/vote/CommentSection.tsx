
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
}

interface CommentSectionProps {
  comments: Comment[];
  onSubmit: (comment: string) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ comments, onSubmit }) => {
  const [comment, setComment] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      onSubmit(comment);
      setComment('');
    }
  };

  return (
    <Card className="w-full">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Comments</h3>
        <ScrollArea className="h-[300px] mb-4">
          {comments.length > 0 ? (
            <div className="space-y-2">
              {comments.map((comment) => (
                <div key={comment.id} className="border rounded-md p-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{comment.author}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(comment.createdAt)} ago
                    </div>
                  </div>
                  <p className="text-sm mt-1">{comment.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          )}
        </ScrollArea>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="resize-none"
          />
          <Button type="submit" disabled={!comment.trim()}>
            Post Comment
          </Button>
        </form>
      </Card>
    </Card>
  );
};

export default CommentSection;
