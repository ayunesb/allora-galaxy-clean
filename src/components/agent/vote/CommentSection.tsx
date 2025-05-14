
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { VoteType } from '@/types/shared';
import { supabase } from '@/lib/supabase';
import { CommentData } from '@/types/voting';

interface CommentSectionProps {
  voteType: VoteType | null;
  onSubmit: (comment: string) => Promise<boolean>;
  isSubmitting?: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  voteType,
  onSubmit,
  isSubmitting = false
}) => {
  const [comment, setComment] = useState('');
  const [recentComments, setRecentComments] = useState<CommentData[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) return;
    
    const success = await onSubmit(comment);
    if (success) {
      setComment('');
      fetchRecentComments(); // Refresh comments after successful submission
    }
  };

  const fetchRecentComments = async () => {
    setIsLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('agent_votes')
        .select(`
          id,
          vote_type,
          comment,
          created_at,
          user_id,
          profiles:user_id(first_name, last_name, avatar_url)
        `)
        .not('comment', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      if (data) {
        setRecentComments(data.map(item => ({
          id: item.id,
          content: item.comment || '',
          user_id: item.user_id,
          created_at: item.created_at,
          vote_type: item.vote_type as VoteType,
          user: item.profiles
        })));
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  useEffect(() => {
    fetchRecentComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder={voteType === 'up' ? "What did you like about this agent?" : "What could be improved?"}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[100px]"
          disabled={isSubmitting || !voteType}
        />
        <Button 
          onClick={handleSubmit} 
          disabled={!comment.trim() || isSubmitting || !voteType}
          variant={voteType === 'up' ? "default" : "outline"}
        >
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </Button>
      </div>
      
      {recentComments.length > 0 && (
        <div className="space-y-3 pt-4 border-t">
          <h3 className="text-sm font-medium">Recent Feedback</h3>
          {recentComments.map(comment => (
            <div key={comment.id} className="p-3 rounded-md bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${comment.vote_type === 'up' ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-muted-foreground">
                  {comment.user?.first_name || 'Anonymous'} • {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
      
      {isLoadingComments && <div className="text-center text-sm text-muted-foreground">Loading comments...</div>}
      {!isLoadingComments && recentComments.length === 0 && (
        <div className="text-center text-sm text-muted-foreground pt-4 border-t">
          No comments yet. Be the first to provide feedback!
        </div>
      )}
    </div>
  );
};
