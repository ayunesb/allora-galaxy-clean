
import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  centered?: boolean;
  fullPage?: boolean;
  transparent?: boolean;
}

/**
 * LoadingIndicator - Consistent loading indicator used throughout the application
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'md',
  className,
  text,
  centered = true,
  fullPage = false,
  transparent = false,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const containerClasses = cn(
    'flex flex-col items-center justify-center',
    {
      'fixed inset-0 z-50': fullPage,
      'absolute inset-0 z-10': centered && !fullPage,
      'h-full w-full': centered,
      'bg-background/80 backdrop-blur-sm': fullPage && !transparent,
      'p-4': !fullPage,
    },
    className
  );

  return (
    <div className={containerClasses}>
      <Loader2 
        className={cn(
          'animate-spin text-primary',
          sizeClasses[size]
        )} 
      />
      {text && (
        <p className={cn('mt-2 text-center text-muted-foreground', {
          'text-xs': size === 'sm',
          'text-sm': size === 'md',
          'text-base': size === 'lg',
          'text-lg': size === 'xl',
        })}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingIndicator;
