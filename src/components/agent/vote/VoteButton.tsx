
import React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { VoteButtonProps } from './types';

const VoteButton: React.FC<VoteButtonProps> = ({ 
  count, 
  active, 
  type, 
  onClick, 
  disabled 
}) => {
  const Icon = type === 'up' ? ThumbsUp : ThumbsDown;
  
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      className="flex items-center gap-1"
      onClick={onClick}
      disabled={disabled}
    >
      <Icon size={16} />
      <span>{count}</span>
    </Button>
  );
};

export default VoteButton;
