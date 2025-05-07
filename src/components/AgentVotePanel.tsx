
import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export interface AgentVotePanelProps {
  agentVersionId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  userId?: string; // Making this optional for backward compatibility
}

const AgentVotePanel: React.FC<AgentVotePanelProps> = ({
  agentVersionId,
  initialUpvotes = 0,
  initialDownvotes = 0,
  userId
}) => {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const { toast } = useToast();

  const handleVote = async (voteType: 'up' | 'down') => {
    try {
      setSubmitting(true);
      
      // Get current user ID if not provided
      let voteUserId = userId;
      if (!voteUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: "Authentication required",
            description: "You must be logged in to vote",
            variant: "destructive"
          });
          return;
        }
        voteUserId = user.id;
      }

      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('agent_votes')
        .select('*')
        .eq('agent_version_id', agentVersionId)
        .eq('user_id', voteUserId)
        .maybeSingle();

      if (existingVote) {
        // User already voted, update the vote
        await supabase
          .from('agent_votes')
          .update({ 
            vote_type: voteType,
            comment: comment.trim() || null 
          })
          .eq('id', existingVote.id);

        // Update vote counters based on changed vote
        if (existingVote.vote_type !== voteType) {
          if (voteType === 'up') {
            setUpvotes(prev => prev + 1);
            setDownvotes(prev => prev - 1);
          } else {
            setUpvotes(prev => prev - 1);
            setDownvotes(prev => prev + 1);
          }
        }
      } else {
        // New vote
        await supabase
          .from('agent_votes')
          .insert({
            agent_version_id: agentVersionId,
            user_id: voteUserId,
            vote_type: voteType,
            comment: comment.trim() || null
          });

        // Update vote counters
        if (voteType === 'up') {
          setUpvotes(prev => prev + 1);
        } else {
          setDownvotes(prev => prev + 1);
        }
      }

      // Update UI state
      setUserVote(voteType);
      setShowComment(false);
      setComment('');
      
      toast({
        title: "Vote submitted",
        description: "Thank you for your feedback!",
      });
    } catch (error) {
      console.error("Error submitting vote:", error);
      toast({
        title: "Error",
        description: "Failed to submit your vote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Agent Performance</h3>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                className={`flex items-center gap-1 ${userVote === 'up' ? 'bg-green-50 border-green-200' : ''}`}
                onClick={() => handleVote('up')}
                disabled={submitting}
              >
                <ThumbsUp className="h-4 w-4" />
                <span>{upvotes}</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className={`flex items-center gap-1 ${userVote === 'down' ? 'bg-red-50 border-red-200' : ''}`}
                onClick={() => handleVote('down')}
                disabled={submitting}
              >
                <ThumbsDown className="h-4 w-4" />
                <span>{downvotes}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowComment(!showComment)}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {showComment && (
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
                  onClick={() => setShowComment(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => {
                    if (userVote) {
                      handleVote(userVote);
                    } else {
                      // Default to upvote if no vote yet
                      handleVote('up');
                    }
                  }}
                  disabled={submitting}
                >
                  Submit
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentVotePanel;
