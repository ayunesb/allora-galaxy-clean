
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { VoteButtonProps } from './types';
import { VoteType } from '@/types/shared';

const VoteButton: React.FC<VoteButtonProps> = ({
  agentVersionId,
  currentVote = null,
  onVoteChange,
  size = 'md',
  showCount = true,
  upvotes = 0,
  downvotes = 0,
  disabled = false,
  className
}) => {
  const handleVote = (voteType: VoteType) => {
    if (disabled || !onVoteChange) return;
    
    // Toggle vote if clicking the same button again
    const newVoteType = currentVote === voteType ? 'neutral' : voteType;
    onVoteChange(newVoteType);
  };

  const buttonSizes = {
    sm: 'h-7 px-2',
    md: 'h-9 px-3',
    lg: 'h-10 px-4'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant={currentVote === 'up' ? 'default' : 'outline'}
        size="sm"
        className={cn(
          buttonSizes[size],
          "rounded-full",
          currentVote === 'up' && "bg-green-500 hover:bg-green-600"
        )}
        onClick={() => handleVote('up')}
        disabled={disabled}
        aria-label="Upvote"
      >
        <ThumbsUp className={cn(iconSizes[size], "mr-1")} />
        {showCount && upvotes > 0 && <span>{upvotes}</span>}
      </Button>
      
      <Button
        variant={currentVote === 'down' ? 'default' : 'outline'}
        size="sm"
        className={cn(
          buttonSizes[size],
          "rounded-full",
          currentVote === 'down' && "bg-red-500 hover:bg-red-600"
        )}
        onClick={() => handleVote('down')}
        disabled={disabled}
        aria-label="Downvote"
      >
        <ThumbsDown className={cn(iconSizes[size], "mr-1")} />
        {showCount && downvotes > 0 && <span>{downvotes}</span>}
      </Button>
    </div>
  );
};

export default VoteButton;
