
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { VoteType } from '@/types/shared';

export interface AgentVote {
  id: string;
  agent_version_id: string;
  vote_type: VoteType;
  user_id: string;
  comment?: string;
  created_at: string;
}

export interface AgentVoteStats {
  upvotes: number;
  downvotes: number;
}

export interface UseAgentVoteProps {
  agentVersionId: string;
}

export interface UseAgentVoteResult {
  userVote: VoteType | null;
  voteStats: AgentVoteStats;
  upvote: () => void;
  downvote: () => void;
  removeVote: () => void;
  addComment: (comment: string) => Promise<boolean>;
  comments: { id: string; user_id: string; comment: string; created_at: string }[];
  isLoading: boolean;
}

export const useAgentVote = ({ agentVersionId }: UseAgentVoteProps): UseAgentVoteResult => {
  const [userVote, setUserVote] = useState<VoteType | null>(null);
  const [voteStats, setVoteStats] = useState<AgentVoteStats>({ upvotes: 0, downvotes: 0 });
  const [comments, setComments] = useState<{ id: string; user_id: string; comment: string; created_at: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVoteStats = async () => {
    if (!agentVersionId) return;
    
    try {
      // Get vote counts
      const { data: versionData, error: versionError } = await supabase
        .from('agent_versions')
        .select('upvotes, downvotes')
        .eq('id', agentVersionId)
        .single();
        
      if (versionError) throw versionError;
      
      if (versionData) {
        setVoteStats({
          upvotes: versionData.upvotes || 0,
          downvotes: versionData.downvotes || 0
        });
      }
    } catch (error) {
      console.error('Error fetching vote stats:', error);
    }
  };

  const fetchUserVote = async () => {
    if (!agentVersionId) return;
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      
      const { data: voteData, error: voteError } = await supabase
        .from('agent_votes')
        .select('vote_type')
        .eq('agent_version_id', agentVersionId)
        .eq('user_id', userData.user.id)
        .single();
        
      if (voteError && voteError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" - not an error for us
        console.error('Error fetching user vote:', voteError);
        return;
      }
      
      if (voteData) {
        setUserVote(voteData.vote_type as VoteType);
      } else {
        setUserVote(null);
      }
    } catch (error) {
      console.error('Error fetching user vote:', error);
    }
  };

  const fetchComments = async () => {
    if (!agentVersionId) return;
    
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('agent_votes')
        .select('id, user_id, comment, created_at')
        .eq('agent_version_id', agentVersionId)
        .not('comment', 'is', null)
        .order('created_at', { ascending: false });
        
      if (commentsError) throw commentsError;
      
      if (commentsData) {
        setComments(commentsData.filter(c => c.comment) as any[]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const vote = async (voteType: VoteType) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to vote',
          variant: 'destructive'
        });
        return;
      }
      
      // If already voted with the same vote type, remove vote
      if (userVote === voteType) {
        await removeVote();
        return;
      }
      
      // First, delete any existing vote
      if (userVote) {
        await supabase
          .from('agent_votes')
          .delete()
          .eq('agent_version_id', agentVersionId)
          .eq('user_id', userData.user.id);
          
        // Update stats
        const adjustment = userVote === 'up' ? -1 : 1;
        const column = userVote === 'up' ? 'upvotes' : 'downvotes';
        
        await supabase
          .from('agent_versions')
          .update({ [column]: voteStats[`${column}`] + adjustment })
          .eq('id', agentVersionId);
      }
      
      // Insert new vote
      const { error: insertError } = await supabase
        .from('agent_votes')
        .insert({
          agent_version_id: agentVersionId,
          user_id: userData.user.id,
          vote_type: voteType
        });
        
      if (insertError) throw insertError;
      
      // Update vote stats
      const column = voteType === 'up' ? 'upvotes' : 'downvotes';
      
      await supabase
        .from('agent_versions')
        .update({ [column]: voteStats[`${column}`] + 1 })
        .eq('id', agentVersionId);
        
      // Update local state
      setUserVote(voteType);
      setVoteStats(prev => ({
        ...prev,
        [column]: prev[column] + 1
      }));
      
      toast({
        title: 'Vote recorded',
        description: `Your ${voteType === 'up' ? 'upvote' : 'downvote'} has been recorded.`,
      });
    } catch (error: any) {
      console.error('Error voting:', error);
      toast({
        title: 'Failed to vote',
        description: error.message || 'An error occurred while voting.',
        variant: 'destructive',
      });
    }
  };

  const removeVote = async () => {
    if (!userVote) return;
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      
      // Delete vote
      const { error: deleteError } = await supabase
        .from('agent_votes')
        .delete()
        .eq('agent_version_id', agentVersionId)
        .eq('user_id', userData.user.id);
        
      if (deleteError) throw deleteError;
      
      // Update vote stats
      const column = userVote === 'up' ? 'upvotes' : 'downvotes';
      
      await supabase
        .from('agent_versions')
        .update({ [column]: voteStats[`${column}`] - 1 })
        .eq('id', agentVersionId);
        
      // Update local state
      setUserVote(null);
      setVoteStats(prev => ({
        ...prev,
        [column]: Math.max(0, prev[column] - 1)
      }));
      
      toast({
        title: 'Vote removed',
        description: 'Your vote has been removed.',
      });
    } catch (error: any) {
      console.error('Error removing vote:', error);
      toast({
        title: 'Failed to remove vote',
        description: error.message || 'An error occurred while removing your vote.',
        variant: 'destructive',
      });
    }
  };

  const upvote = () => vote('up');
  const downvote = () => vote('down');

  const addComment = async (comment: string): Promise<boolean> => {
    if (!comment.trim()) return false;
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to comment',
          variant: 'destructive'
        });
        return false;
      }
      
      // Check if user has already voted
      let hasVoted = !!userVote;
      
      if (!hasVoted) {
        // Create a default upvote along with the comment
        const { error: voteError } = await supabase
          .from('agent_votes')
          .insert({
            agent_version_id: agentVersionId,
            user_id: userData.user.id,
            vote_type: 'up',
            comment
          });
          
        if (voteError) throw voteError;
        
        // Update vote stats
        await supabase
          .from('agent_versions')
          .update({ upvotes: voteStats.upvotes + 1 })
          .eq('id', agentVersionId);
          
        // Update local state
        setUserVote('up');
        setVoteStats(prev => ({
          ...prev,
          upvotes: prev.upvotes + 1
        }));
      } else {
        // Update existing vote with comment
        const { error: updateError } = await supabase
          .from('agent_votes')
          .update({ comment })
          .eq('agent_version_id', agentVersionId)
          .eq('user_id', userData.user.id);
          
        if (updateError) throw updateError;
      }
      
      // Refresh comments
      await fetchComments();
      
      toast({
        title: 'Comment added',
        description: 'Your feedback has been recorded.',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Failed to add comment',
        description: error.message || 'An error occurred while adding your comment.',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    if (agentVersionId) {
      const loadData = async () => {
        setIsLoading(true);
        await Promise.all([
          fetchUserVote(),
          fetchVoteStats(),
          fetchComments()
        ]);
        setIsLoading(false);
      };
      
      loadData();
    }
  }, [agentVersionId]);

  return {
    userVote,
    voteStats,
    upvote,
    downvote,
    removeVote,
    addComment,
    comments,
    isLoading
  };
};

export default useAgentVote;
