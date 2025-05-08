
import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoteButtonProps } from './types';

export const VoteButton: React.FC<VoteButtonProps> = ({
  count,
  isActive,
  type,
  onClick,
  disabled
}) => {
  const Icon = type === 'up' ? ThumbsUp : ThumbsDown;
  const activeClass = isActive ? 
    (type === 'up' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200') : '';

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className={`flex items-center gap-1 ${activeClass}`}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon className="h-4 w-4" />
      <span>{count}</span>
    </Button>
  );
};
