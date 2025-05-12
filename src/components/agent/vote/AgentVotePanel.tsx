
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { VoteButton } from './VoteButton';
import { CommentSection } from './CommentSection';
import { getUserVote } from '@/lib/agents/voting/getUserVote';
import { voteOnAgentVersion } from '@/lib/agents/voting/voteOnAgentVersion';
import { getAgentVoteStats } from '@/lib/agents/voting/getAgentVoteStats';
import type { VoteType } from '@/types/shared';

interface AgentVotePanelProps {
  agentVersionId: string;
  initialUpvotes?: number;
  initialDownvotes?: number;
}

const AgentVotePanel: React.FC<AgentVotePanelProps> = ({ 
  agentVersionId,
  initialUpvotes = 0, 
  initialDownvotes = 0 
}) => {
  const { user } = useAuth();
  const [userVote, setUserVote] = useState<VoteType | null>(null);
  const [userComment, setUserComment] = useState<string>('');
  const [upvotes, setUpvotes] = useState<number>(initialUpvotes);
  const [downvotes, setDownvotes] = useState<number>(initialDownvotes);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load the user's existing vote if they are logged in
  useEffect(() => {
    const loadUserVote = async () => {
      if (!user) return;
      
      try {
        const voteInfo = await getUserVote(user.id, agentVersionId);
        if (voteInfo.hasVoted && voteInfo.vote) {
          setUserVote(voteInfo.vote.voteType);
          setUserComment(voteInfo.vote.comment || '');
        }
      } catch (error) {
        console.error('Error loading user vote:', error);
      }
    };

    // Load vote stats
    const loadVoteStats = async () => {
      try {
        const stats = await getAgentVoteStats(agentVersionId);
        setUpvotes(stats.upvotes);
        setDownvotes(stats.downvotes);
      } catch (error) {
        console.error('Error loading vote stats:', error);
      }
    };
    
    loadUserVote();
    loadVoteStats();
  }, [user, agentVersionId]);

  const handleVote = async (voteType: VoteType) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // If user is clicking the same vote type they already selected, treat as removing vote
      const newVoteType = userVote === voteType ? null : voteType;
      
      // Process the vote
      if (newVoteType) {
        const result = await voteOnAgentVersion(user.id, agentVersionId, newVoteType, userComment);
        
        if (result.success) {
          setUserVote(newVoteType);
          setUpvotes(result.upvotes);
          setDownvotes(result.downvotes);
        }
      } else {
        // Remove the vote (implementation would depend on your backend)
        // This is a simplified example
        const result = await voteOnAgentVersion(user.id, agentVersionId, voteType, userComment);
        
        if (result.success) {
          setUserVote(null);
          setUpvotes(result.upvotes);
          setDownvotes(result.downvotes);
        }
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentChange = (comment: string) => {
    setUserComment(comment);
  };

  const handleCommentSubmit = async () => {
    if (!user || !userVote) return;
    
    setIsLoading(true);
    try {
      const result = await voteOnAgentVersion(user.id, agentVersionId, userVote, userComment);
      
      if (result.success) {
        // Comment updated successfully
        console.log('Comment updated');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center space-x-6">
        <VoteButton 
          type="up"
          count={upvotes}
          isActive={userVote === 'upvote'}
          onClick={() => handleVote('upvote')}
          disabled={isLoading || !user}
        />
        
        <VoteButton 
          type="down"
          count={downvotes}
          isActive={userVote === 'downvote'}
          onClick={() => handleVote('downvote')}
          disabled={isLoading || !user}
        />
      </div>
      
      {user && userVote && (
        <CommentSection
          comment={userComment}
          setComment={handleCommentChange}
          onSubmit={handleCommentSubmit}
          onCancel={() => {}}
          disabled={isLoading}
        />
      )}
      
      {!user && (
        <p className="text-center text-sm text-muted-foreground">
          Sign in to vote on this agent version
        </p>
      )}
    </div>
  );
};

export default AgentVotePanel;
