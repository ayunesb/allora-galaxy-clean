
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Comment, UseAgentVoteProps, UseAgentVoteResult } from './types';
import { VoteType } from '@/types/shared';

export const useAgentVote = ({ agentVersionId }: UseAgentVoteProps): UseAgentVoteResult => {
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [userVote, setUserVote] = useState<VoteType | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!agentVersionId) return;
    
    const fetchVotes = async () => {
      try {
        // Fetch vote counts
        const { data: votes, error } = await supabase
          .from('agent_votes')
          .select('vote_type')
          .eq('agent_version_id', agentVersionId);
          
        if (error) throw error;
        
        const upvoteCount = votes?.filter(vote => vote.vote_type === 'up').length || 0;
        const downvoteCount = votes?.filter(vote => vote.vote_type === 'down').length || 0;
        
        setUpvotes(upvoteCount);
        setDownvotes(downvoteCount);
        
        // Fetch user's vote
        const { data: userAuth } = await supabase.auth.getUser();
        if (userAuth?.user) {
          const { data: userVoteData } = await supabase
            .from('agent_votes')
            .select('vote_type')
            .eq('agent_version_id', agentVersionId)
            .eq('user_id', userAuth.user.id)
            .maybeSingle();
            
          setUserVote(userVoteData?.vote_type as VoteType || null);
        }
        
        // Fetch comments
        const { data: commentsData } = await supabase
          .from('agent_comments')
          .select('*')
          .eq('agent_version_id', agentVersionId)
          .order('created_at', { ascending: false });
          
        setComments(commentsData || []);
      } catch (err) {
        console.error('Failed to fetch votes:', err);
      }
    };
    
    fetchVotes();
  }, [agentVersionId]);

  const handleVote = async (voteType: VoteType) => {
    try {
      setIsSubmitting(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('User not authenticated');
      
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('agent_votes')
        .select('*')
        .eq('agent_version_id', agentVersionId)
        .eq('user_id', userData.user.id)
        .maybeSingle();
        
      if (existingVote) {
        // If clicking same vote type, remove the vote
        if (existingVote.vote_type === voteType) {
          await supabase
            .from('agent_votes')
            .delete()
            .eq('id', existingVote.id);
            
          setUserVote(null);
          if (voteType === 'up') {
            setUpvotes(prev => Math.max(0, prev - 1));
          } else {
            setDownvotes(prev => Math.max(0, prev - 1));
          }
        } else {
          // Change vote type
          await supabase
            .from('agent_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);
            
          setUserVote(voteType);
          if (voteType === 'up') {
            setUpvotes(prev => prev + 1);
            setDownvotes(prev => Math.max(0, prev - 1));
          } else {
            setDownvotes(prev => prev + 1);
            setUpvotes(prev => Math.max(0, prev - 1));
          }
        }
      } else {
        // Create new vote
        await supabase.from('agent_votes').insert({
          agent_version_id: agentVersionId,
          user_id: userData.user.id,
          vote_type: voteType
        });
        
        setUserVote(voteType);
        if (voteType === 'up') {
          setUpvotes(prev => prev + 1);
        } else {
          setDownvotes(prev => prev + 1);
        }
      }
    } catch (err) {
      console.error('Failed to submit vote:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = () => handleVote('up');
  const handleDownvote = () => handleVote('down');
  
  const handleCommentSubmit = async (comment: string) => {
    if (!comment.trim()) return;
    
    try {
      setIsSubmitting(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('agent_comments')
        .insert({
          agent_version_id: agentVersionId,
          user_id: userData.user.id,
          comment
        })
        .select('*')
        .single();
        
      if (error) throw error;
      
      setComments(prev => [data, ...prev]);
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    upvotes,
    downvotes,
    userVote,
    comments,
    isSubmitting,
    handleUpvote,
    handleDownvote,
    handleCommentSubmit
  };
};

export default useAgentVote;
