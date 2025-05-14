
import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { VoteType } from '@/types/shared';
import { useAgentVote } from './useAgentVote';

interface VoteButtonProps {
  agentVersionId: string;
  userVote?: VoteType | null;
  upvotes?: number;
  downvotes?: number;
  size?: 'sm' | 'md' | 'lg';
  onVoteChange?: (voteType: VoteType, success: boolean) => void;
  disabled?: boolean;
  showCounts?: boolean;
  className?: string;
}

export function VoteButton({
  agentVersionId,
  userVote,
  upvotes = 0,
  downvotes = 0,
  size = 'md',
  onVoteChange,
  disabled = false,
  showCounts = true,
  className,
}: VoteButtonProps) {
  const { castVote, isLoading } = useAgentVote(agentVersionId);
  
  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-9 text-sm',
    lg: 'h-10 text-base'
  };
  
  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18
  };
  
  const handleVote = async (voteType: VoteType) => {
    if (disabled || isLoading) return;
    
    const result = await castVote(voteType);
    if (onVoteChange) {
      onVoteChange(voteType, result.success);
    }
  };

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <Button
        variant={userVote === VoteType.Up ? "default" : "outline"}
        size="icon"
        className={cn(
          sizeClasses[size],
          "rounded-r-none border-r-0",
          userVote === VoteType.Up && "bg-green-500 hover:bg-green-600"
        )}
        disabled={disabled || isLoading}
        onClick={() => handleVote(VoteType.Up)}
        title="Upvote"
      >
        <ThumbsUp size={iconSizes[size]} />
        {showCounts && (
          <span className="ml-1">{upvotes}</span>
        )}
      </Button>
      
      <Button
        variant={userVote === VoteType.Down ? "default" : "outline"}
        size="icon"
        className={cn(
          sizeClasses[size],
          "rounded-l-none",
          userVote === VoteType.Down && "bg-red-500 hover:bg-red-600"
        )}
        disabled={disabled || isLoading}
        onClick={() => handleVote(VoteType.Down)}
        title="Downvote"
      >
        <ThumbsDown size={iconSizes[size]} />
        {showCounts && (
          <span className="ml-1">{downvotes}</span>
        )}
      </Button>
    </div>
  );
}
