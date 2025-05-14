
import React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'sm',
  className,
}) => {
  const sizeClass = {
    'sm': 'h-4 w-4',
    'md': 'h-6 w-6',
    'lg': 'h-8 w-8'
  };

  return (
    <div 
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeClass[size],
        className
      )} 
      role="status" 
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
