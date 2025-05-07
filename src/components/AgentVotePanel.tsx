
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AgentVotePanelProps {
  agentVersionId: string;
  pluginId: string;
  initialUpvotes?: number;
  initialDownvotes?: number;
  onVoteSuccess?: () => void;
}

const AgentVotePanel: React.FC<AgentVotePanelProps> = ({
  agentVersionId,
  pluginId,
  initialUpvotes = 0,
  initialDownvotes = 0,
  onVoteSuccess
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Check if the user has already voted on this agent version
  useEffect(() => {
    const checkExistingVote = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('agent_votes')
          .select('vote_type, comment')
          .eq('agent_version_id', agentVersionId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setUserVote(data.vote_type as 'up' | 'down');
          if (data.comment) {
            setComment(data.comment);
          }
        }
      } catch (err: any) {
        console.error('Error checking existing vote:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      checkExistingVote();
    }
  }, [user, agentVersionId]);
  
  // Submit a vote
  const submitVote = async (voteType: 'up' | 'down') => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You need to be logged in to vote on agent versions.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Check if user already voted
      if (userVote) {
        // If voting the same way, remove the vote
        if (userVote === voteType) {
          const { error } = await supabase
            .from('agent_votes')
            .delete()
            .eq('agent_version_id', agentVersionId)
            .eq('user_id', user.id);
          
          if (error) throw error;
          
          // Update the agent version vote count
          await supabase.rpc('update_agent_vote_count', {
            agent_id: agentVersionId,
            vote_change: voteType === 'up' ? -1 : 0,
            downvote_change: voteType === 'down' ? -1 : 0
          });
          
          // Update local state
          setUserVote(null);
          setComment('');
          setUpvotes(prev => voteType === 'up' ? prev - 1 : prev);
          setDownvotes(prev => voteType === 'down' ? prev - 1 : prev);
          
          toast({
            title: 'Vote Removed',
            description: 'Your vote has been removed.'
          });
        } else {
          // Change vote from up to down or vice versa
          const { error } = await supabase
            .from('agent_votes')
            .update({ 
              vote_type: voteType,
              comment: comment || null
            })
            .eq('agent_version_id', agentVersionId)
            .eq('user_id', user.id);
          
          if (error) throw error;
          
          // Update the agent version vote count (flip both counts)
          await supabase.rpc('update_agent_vote_count', {
            agent_id: agentVersionId,
            vote_change: voteType === 'up' ? 1 : -1,
            downvote_change: voteType === 'down' ? 1 : -1
          });
          
          // Update local state
          setUserVote(voteType);
          if (voteType === 'up') {
            setUpvotes(prev => prev + 1);
            setDownvotes(prev => prev - 1);
          } else {
            setUpvotes(prev => prev - 1);
            setDownvotes(prev => prev + 1);
          }
          
          toast({
            title: 'Vote Changed',
            description: `You've changed your vote.`
          });
        }
      } else {
        // New vote
        const { error } = await supabase
          .from('agent_votes')
          .insert({
            agent_version_id: agentVersionId,
            user_id: user.id,
            vote_type: voteType,
            comment: comment || null
          });
        
        if (error) throw error;
        
        // Update the agent version vote count
        await supabase.rpc('update_agent_vote_count', {
          agent_id: agentVersionId,
          vote_change: voteType === 'up' ? 1 : 0,
          downvote_change: voteType === 'down' ? 1 : 0
        });
        
        // Update local state
        setUserVote(voteType);
        setUpvotes(prev => voteType === 'up' ? prev + 1 : prev);
        setDownvotes(prev => voteType === 'down' ? prev + 1 : prev);
        
        toast({
          title: 'Vote Recorded',
          description: 'Thank you for your feedback!'
        });
      }
      
      // Call the success callback if provided
      if (onVoteSuccess) {
        onVoteSuccess();
      }
      
    } catch (err: any) {
      console.error('Error submitting vote:', err);
      toast({
        title: 'Error',
        description: 'Failed to submit your vote. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Save just the comment without changing the vote
  const saveComment = async () => {
    if (!user || !userVote) return;
    
    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('agent_votes')
        .update({ comment })
        .eq('agent_version_id', agentVersionId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: 'Comment Saved',
        description: 'Your feedback has been recorded.'
      });
      
      // Call the success callback if provided
      if (onVoteSuccess) {
        onVoteSuccess();
      }
      
    } catch (err: any) {
      console.error('Error saving comment:', err);
      toast({
        title: 'Error',
        description: 'Failed to save your comment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Rate this Agent</CardTitle>
        <CardDescription>
          Help improve our AI agents with your feedback.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="text-center">
            <Button
              size="lg"
              variant={userVote === 'up' ? 'default' : 'outline'}
              onClick={() => submitVote('up')}
              disabled={submitting}
              className={`flex flex-col items-center p-6 ${userVote === 'up' ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              <ThumbsUp className="h-8 w-8 mb-2" />
              <span className="text-lg font-bold">{upvotes}</span>
            </Button>
            <span className="text-sm text-muted-foreground mt-1">Upvotes</span>
          </div>
          
          <div className="text-center">
            <Button
              size="lg"
              variant={userVote === 'down' ? 'default' : 'outline'}
              onClick={() => submitVote('down')}
              disabled={submitting}
              className={`flex flex-col items-center p-6 ${userVote === 'down' ? 'bg-red-600 hover:bg-red-700' : ''}`}
            >
              <ThumbsDown className="h-8 w-8 mb-2" />
              <span className="text-lg font-bold">{downvotes}</span>
            </Button>
            <span className="text-sm text-muted-foreground mt-1">Downvotes</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="comment" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Feedback Comment
            </label>
            <Textarea
              id="comment"
              placeholder="What worked well? What could be improved?"
              className="mt-2"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={submitting || !userVote}
            />
          </div>
          
          {userVote && (
            <Button 
              onClick={saveComment} 
              disabled={submitting || !comment.trim()}
              className="w-full"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Comment
            </Button>
          )}
          
          {!user && (
            <p className="text-sm text-muted-foreground text-center">
              You need to be logged in to vote on agent versions.
            </p>
          )}
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <Badge variant="outline" className="text-xs">
            Version Info
          </Badge>
          <span className="text-xs text-muted-foreground">
            Agent ID: {agentVersionId.substring(0, 8)}...
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentVotePanel;
