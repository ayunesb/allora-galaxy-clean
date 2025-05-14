
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { VoteType } from '@/types/voting';
import { User } from '@/types/user';

export interface CommentData {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  vote_type: VoteType;
  user: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}

interface CommentSectionProps {
  comments: CommentData[];
  isLoading: boolean;
  onAddComment: (comment: string) => Promise<boolean>;
  voteType?: VoteType | null;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  isLoading,
  onAddComment,
  voteType,
}) => {
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState<CommentData[]>([]);
  
  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;
    
    setSubmitting(true);
    try {
      const success = await onAddComment(newComment.trim());
      if (success) {
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (user: { first_name?: string; last_name?: string }) => {
    const first = user.first_name ? user.first_name[0] : '';
    const last = user.last_name ? user.last_name[0] : '';
    return `${first}${last}`.toUpperCase();
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading comments...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Comments</h3>
      
      {localComments.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-4">
          {localComments.map((comment) => (
            <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-secondary/30">
              <Avatar className="h-8 w-8">
                {comment.user?.avatar_url && (
                  <AvatarImage src={comment.user.avatar_url} alt="User" />
                )}
                <AvatarFallback>{getInitials(comment.user)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-sm">
                    {comment.user?.first_name} {comment.user?.last_name}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                  </span>
                </div>
                <p className="text-sm mt-1">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="mt-4">
        <Textarea
          placeholder={
            voteType
              ? "Share why you " +
                (voteType === "up" ? "liked" : "disliked") +
                " this agent..."
              : "Write a comment..."
          }
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="mb-2"
        />
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={!newComment.trim() || submitting}
            className="mt-2"
          >
            {submitting ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;
