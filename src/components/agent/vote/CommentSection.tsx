
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { CommentSectionProps } from './types';
import { formatDistanceToNow } from 'date-fns';
import { Comment } from '@/types/shared';

const CommentSection: React.FC<CommentSectionProps> = ({
  agentVersionId,
  comments = [],
  onAddComment,
  loading = false,
  maxHeight = '400px'
}) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !onAddComment) return;

    setIsSubmitting(true);
    try {
      await onAddComment(commentText);
      setCommentText('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <h3 className="text-lg font-medium">Comments</h3>
      
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder="Add your comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="min-h-[80px]"
          disabled={isSubmitting}
        />
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={!commentText.trim() || isSubmitting}
            size="sm"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      </form>
      
      <div 
        className="space-y-4 mt-4 overflow-y-auto" 
        style={{ maxHeight }}
      >
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin h-6 w-6 border-t-2 border-primary rounded-full" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="border rounded-md p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={`https://avatar.vercel.sh/${comment.user?.id || 'user'}?size=32`} />
                  <AvatarFallback>
                    {comment.user?.first_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm">
                  {comment.user?.first_name || 'Anonymous'}
                </span>
                <span className="text-muted-foreground text-xs">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground text-sm py-4">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
