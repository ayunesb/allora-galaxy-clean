
import React from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export interface LoadingStateProps {
  /** Text to display while loading */
  text?: string;
  /** Size of the loading spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to center the loading state */
  center?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Consistent loading state component to use across the app
 */
export function LoadingState({
  text = 'Loading...',
  size = 'md',
  center = true,
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex items-center p-4',
        center && 'justify-center',
        className
      )}
      data-testid="loading-state"
    >
      <LoadingSpinner size={size} className="mr-2" />
      {text && <span className="text-muted-foreground">{text}</span>}
    </div>
  );
}

/**
 * Full page loading state component
 */
export function PageLoadingState({
  text = 'Loading page...',
  className,
}: Omit<LoadingStateProps, 'center' | 'size'>) {
  return (
    <div
      className={cn(
        'flex h-[50vh] w-full flex-col items-center justify-center',
        className
      )}
      data-testid="page-loading-state"
    >
      <LoadingSpinner size="lg" className="mb-4" />
      {text && <p className="text-muted-foreground">{text}</p>}
    </div>
  );
}

/**
 * Card loading state with animated skeleton
 */
export function CardLoadingSkeleton({
  rows = 3,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div
      className={cn('space-y-4 p-4', className)}
      data-testid="card-loading-skeleton"
    >
      <div className="h-6 w-3/4 animate-pulse rounded-md bg-muted"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-4 w-full animate-pulse rounded-md bg-muted"
          style={{ width: `${Math.max(60, 100 - i * 10)}%` }}
        ></div>
      ))}
    </div>
  );
}
