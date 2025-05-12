
import React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface VoteButtonProps {
  type: 'up' | 'down';
  count: number;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
}

export const VoteButton: React.FC<VoteButtonProps> = ({
  type,
  count,
  isActive,
  onClick,
  disabled
}) => {
  return (
    <div className="flex flex-col items-center">
      <Button
        size="sm"
        variant={isActive ? "default" : "outline"}
        onClick={onClick}
        disabled={disabled}
        className="rounded-full h-10 w-10 p-0"
      >
        {type === 'up' ? (
          <ThumbsUp className="h-5 w-5" />
        ) : (
          <ThumbsDown className="h-5 w-5" />
        )}
      </Button>
      <span className="mt-1 text-sm font-medium">{count}</span>
    </div>
  );
};
