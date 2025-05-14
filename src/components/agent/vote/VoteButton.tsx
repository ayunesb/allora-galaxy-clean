
import React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { VoteButtonProps } from './types';
import { cn } from '@/lib/utils';

const VoteButton: React.FC<VoteButtonProps> = ({
  type,
  count,
  active,
  onClick,
  disabled
}) => {
  const Icon = type === 'up' ? ThumbsUp : ThumbsDown;
  
  return (
    <div className="flex flex-col items-center">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "rounded-full h-12 w-12",
          active && (type === 'up' ? 'text-green-500' : 'text-red-500')
        )}
        onClick={onClick}
        disabled={disabled}
      >
        <Icon className={cn("h-6 w-6", active && "fill-current")} />
      </Button>
      <span className="text-sm mt-1">{count}</span>
    </div>
  );
};

export default VoteButton;
