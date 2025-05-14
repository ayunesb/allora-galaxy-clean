
import React from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './loading-spinner';

type LoadingProps = {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
};

export function Loading({ 
  fullScreen = false, 
  size = 'md', 
  text = 'Loading...', 
  className 
}: LoadingProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <LoadingSpinner size={size} />
        {text && <p className="mt-4 text-muted-foreground font-medium">{text}</p>}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center p-4", className)}>
      <LoadingSpinner size={size} />
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

// Usage: Overlay loading
export function LoadingOverlay({ text }: { text?: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loading text={text} />
    </div>
  );
}

// Usage: Inline loading
export function LoadingInline({ text }: { text?: string }) {
  return <Loading size="sm" text={text} />;
}
