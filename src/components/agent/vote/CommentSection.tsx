import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

interface CommentSectionProps {
  agentVersionId: string;
  onSubmitComment: (comment: string) => void;
}

export function CommentSection({ agentVersionId, onSubmitComment }: CommentSectionProps) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!comment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmitComment(comment.trim());
      setComment('');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Leave feedback</h3>
      
      <Textarea
        placeholder="Share your thoughts about this agent version..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="resize-none"
      />
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={!comment.trim() || isSubmitting}
          size="sm"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </div>
      
      {/* Future enhancement: Display existing comments */}
      <div className="mt-4 space-y-2">
        {/* {comments.map(comment => (
          <Card key={comment.id}>
            <CardContent className="p-3">
              <p className="text-sm">{comment.text}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-muted-foreground">By {comment.user}</span>
                <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        ))} */}
      </div>
    </div>
  );
}
