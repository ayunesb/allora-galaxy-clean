
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { VoteType } from '@/types/voting';
import { useAuth } from '@/hooks/useAuth';
import { CommentData } from '@/components/agent/vote/CommentSection';

interface UseAgentVoteResult {
  userVote: VoteType | null;
  upvotes: number;
  downvotes: number;
  comments: CommentData[];
  isLoading: boolean;
  error: Error | null;
  submitVote: (type: VoteType) => Promise<{ success: boolean; error?: Error }>;
  submitComment: (comment: string) => Promise<{ success: boolean; error?: Error }>;
}

export const useAgentVote = (agentId: string): UseAgentVoteResult => {
  const [userVote, setUserVote] = useState<VoteType | null>(null);
  const [upvotes, setUpvotes] = useState<number>(0);
  const [downvotes, setDownvotes] = useState<number>(0);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    if (agentId && user) {
      loadVotingData();
    } else if (!user) {
      setIsLoading(false);
    }
  }, [agentId, user]);
  
  const loadVotingData = async () => {
    if (!user || !agentId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get vote counts
      const { data: countData, error: countError } = await supabase
        .from('agent_votes')
        .select('vote_type, count(*)', { count: 'exact' })
        .eq('agent_id', agentId)
        .group('vote_type');
      
      if (countError) throw new Error(countError.message);
      
      // Process vote counts
      if (countData) {
        const up = countData.find(row => row.vote_type === 'up');
        const down = countData.find(row => row.vote_type === 'down');
        setUpvotes(up ? up.count : 0);
        setDownvotes(down ? down.count : 0);
      }
      
      // Get user's vote if logged in
      if (user) {
        const { data: userVoteData, error: userVoteError } = await supabase
          .from('agent_votes')
          .select('vote_type')
          .eq('agent_id', agentId)
          .eq('user_id', user.id)
          .single();
        
        if (userVoteError && userVoteError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" which is expected if user hasn't voted
          console.error('Error fetching user vote:', userVoteError);
        }
        
        if (userVoteData) {
          setUserVote(userVoteData.vote_type as VoteType);
        }
      }
      
      // Get comments
      const { data: commentData, error: commentError } = await supabase
        .from('agent_votes')
        .select(`
          id,
          comment as content,
          user_id,
          created_at,
          vote_type,
          profiles:user_id (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('agent_id', agentId)
        .not('comment', 'is', null)
        .order('created_at', { ascending: false });
      
      if (commentError) throw new Error(commentError.message);
      
      // Format comments
      if (commentData) {
        const formattedComments: CommentData[] = commentData.map(item => ({
          id: item.id,
          content: item.content,
          user_id: item.user_id,
          created_at: item.created_at,
          vote_type: item.vote_type,
          user: item.profiles || { first_name: 'Anonymous', last_name: 'User' }
        }));
        setComments(formattedComments);
      }
    } catch (err) {
      console.error('Error loading voting data:', err);
      setError(err instanceof Error ? err : new Error('Failed to load voting data'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const submitVote = async (type: VoteType): Promise<{ success: boolean; error?: Error }> => {
    if (!user) {
      return { success: false, error: new Error('User not authenticated') };
    }
    
    try {
      const existingVoteType = userVote;
      
      // Optimistically update UI
      setUserVote(type);
      if (existingVoteType === 'up' && type === 'down') {
        setUpvotes(prev => Math.max(0, prev - 1));
        setDownvotes(prev => prev + 1);
      } else if (existingVoteType === 'down' && type === 'up') {
        setDownvotes(prev => Math.max(0, prev - 1));
        setUpvotes(prev => prev + 1);
      } else if (existingVoteType === null) {
        if (type === 'up') setUpvotes(prev => prev + 1);
        if (type === 'down') setDownvotes(prev => prev + 1);
      }
      
      // Submit to database
      if (existingVoteType) {
        // Update existing vote
        const { error: updateError } = await supabase
          .from('agent_votes')
          .update({ vote_type: type })
          .eq('agent_id', agentId)
          .eq('user_id', user.id);
        
        if (updateError) throw updateError;
      } else {
        // Insert new vote
        const { error: insertError } = await supabase
          .from('agent_votes')
          .insert({
            agent_id: agentId,
            user_id: user.id,
            vote_type: type
          });
        
        if (insertError) throw insertError;
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error submitting vote:', err);
      
      // Revert optimistic update
      await loadVotingData();
      
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to submit vote')
      };
    }
  };
  
  const submitComment = async (comment: string): Promise<{ success: boolean; error?: Error }> => {
    if (!user) {
      return { success: false, error: new Error('User not authenticated') };
    }
    
    if (!userVote) {
      return { success: false, error: new Error('Must vote before commenting') };
    }
    
    try {
      // Find user's vote record
      const { data: voteRecord, error: findError } = await supabase
        .from('agent_votes')
        .select('id')
        .eq('agent_id', agentId)
        .eq('user_id', user.id)
        .single();
      
      if (findError) throw findError;
      
      if (!voteRecord) {
        throw new Error('Vote record not found');
      }
      
      // Update vote with comment
      const { error: updateError } = await supabase
        .from('agent_votes')
        .update({ comment })
        .eq('id', voteRecord.id);
      
      if (updateError) throw updateError;
      
      // Optimistically update comments
      const newComment: CommentData = {
        id: voteRecord.id,
        content: comment,
        user_id: user.id,
        created_at: new Date().toISOString(),
        vote_type: userVote,
        user: {
          // Use user profile data if available
          first_name: user.user_metadata?.first_name || 'User',
          last_name: user.user_metadata?.last_name || '',
          avatar_url: user.user_metadata?.avatar_url || ''
        }
      };
      
      setComments(prev => [newComment, ...prev.filter(c => c.id !== voteRecord.id)]);
      
      return { success: true };
    } catch (err) {
      console.error('Error submitting comment:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to submit comment')
      };
    }
  };
  
  return {
    userVote,
    upvotes,
    downvotes,
    comments,
    isLoading,
    error,
    submitVote,
    submitComment
  };
};

export default useAgentVote;
