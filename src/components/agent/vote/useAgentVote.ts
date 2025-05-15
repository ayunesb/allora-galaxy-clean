
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { notify } from '@/lib/notifications/toast';
import type { Vote, VoteType } from '@/types/voting';

export function useAgentVote(agentVersionId: string) {
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [loading, setLoading] = useState(true);
  const [voteInProgress, setVoteInProgress] = useState(false);
  const { session } = useAuth();
  
  // Load votes data
  useEffect(() => {
    const fetchVotes = async () => {
      setLoading(true);
      
      try {
        // Get vote counts
        const { data: voteData, error: voteError } = await supabase.rpc(
          'get_agent_version_votes',
          { agent_version_id: agentVersionId }
        );
        
        if (voteError) {
          throw new Error(`Error fetching votes: ${voteError.message}`);
        }
        
        setUpvotes(voteData?.upvotes || 0);
        setDownvotes(voteData?.downvotes || 0);
        
        // Get user's vote if logged in
        if (session?.user?.id) {
          const { data, error } = await supabase
            .from('agent_votes')
            .select('*')
            .eq('agent_version_id', agentVersionId)
            .eq('user_id', session.user.id)
            .single();
            
          if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            throw new Error(`Error fetching user vote: ${error.message}`);
          }
          
          if (data) {
            setUserVote(data as Vote);
          }
        }
      } catch (error) {
        console.error('Error in useAgentVote:', error);
        notify({ 
          title: 'Error loading votes',
          description: error instanceof Error ? error.message : 'Unknown error'
        }, { type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchVotes();
  }, [agentVersionId, session?.user?.id]);
  
  // Vote handler
  const handleVote = async (voteType: VoteType) => {
    if (!session?.user?.id) {
      notify({ 
        title: 'Authentication required',
        description: 'Please sign in to vote'
      }, { type: 'warning' });
      return;
    }
    
    setVoteInProgress(true);
    
    try {
      let action: 'add' | 'update' | 'remove' = 'add';
      
      // Determine action based on current vote state
      if (!userVote) {
        action = 'add';
      } else if (userVote.vote_type === voteType) {
        action = 'remove';
      } else {
        action = 'update';
      }
      
      // Call appropriate RPC function
      const { data, error } = await supabase.rpc(
        'vote_on_agent_version',
        {
          p_agent_version_id: agentVersionId,
          p_vote_type: voteType,
          p_action: action
        }
      );
      
      if (error) {
        throw new Error(`Error processing vote: ${error.message}`);
      }
      
      // Update local state
      if (action === 'add') {
        if (voteType === 'upvote') {
          setUpvotes(prev => prev + 1);
          setUserVote({
            id: data.id,
            agent_version_id: agentVersionId,
            user_id: session.user.id,
            vote_type: voteType,
            created_at: new Date().toISOString()
          });
        } else {
          setDownvotes(prev => prev + 1);
          setUserVote({
            id: data.id,
            agent_version_id: agentVersionId,
            user_id: session.user.id,
            vote_type: voteType,
            created_at: new Date().toISOString()
          });
        }
      } else if (action === 'update') {
        if (voteType === 'upvote') {
          setUpvotes(prev => prev + 1);
          setDownvotes(prev => prev - 1);
          setUserVote(prev => prev ? { ...prev, vote_type: voteType } : null);
        } else {
          setUpvotes(prev => prev - 1);
          setDownvotes(prev => prev + 1);
          setUserVote(prev => prev ? { ...prev, vote_type: voteType } : null);
        }
      } else {
        if (userVote?.vote_type === 'upvote') {
          setUpvotes(prev => prev - 1);
        } else {
          setDownvotes(prev => prev - 1);
        }
        setUserVote(null);
      }
      
      notify({ 
        title: 'Vote submitted',
        description: action === 'remove' ? 'Your vote has been removed' : 'Thank you for your feedback'
      });
    } catch (error) {
      console.error('Error submitting vote:', error);
      notify({ 
        title: 'Error submitting vote',
        description: error instanceof Error ? error.message : 'Unknown error'
      }, { type: 'error' });
    } finally {
      setVoteInProgress(false);
    }
  };
  
  // Comment handler
  const handleComment = async (comment: string) => {
    if (!userVote || !session?.user?.id) {
      notify({ 
        title: 'Vote required',
        description: 'Please vote before adding a comment'
      }, { type: 'warning' });
      return;
    }
    
    setVoteInProgress(true);
    
    try {
      const { error } = await supabase
        .from('agent_votes')
        .update({ comment })
        .eq('id', userVote.id);
        
      if (error) {
        throw new Error(`Error saving comment: ${error.message}`);
      }
      
      setUserVote(prev => prev ? { ...prev, comment } : null);
      
      notify({ 
        title: 'Comment saved',
        description: 'Thank you for your feedback'
      });
    } catch (error) {
      console.error('Error saving comment:', error);
      notify({ 
        title: 'Error saving comment',
        description: error instanceof Error ? error.message : 'Unknown error'
      }, { type: 'error' });
    } finally {
      setVoteInProgress(false);
    }
  };
  
  return {
    upvotes,
    downvotes,
    userVote,
    loading,
    voteInProgress,
    handleVote,
    handleComment
  };
}
