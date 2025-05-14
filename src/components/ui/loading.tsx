
import { Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function Loading({ size = 'default', className }: LoadingProps) {
  const sizeClass = 
    size === 'sm' ? 'h-4 w-4' : 
    size === 'lg' ? 'h-8 w-8' : 
    'h-6 w-6';
    
  return (
    <div className="flex items-center justify-center">
      <Loader className={cn(sizeClass, "animate-spin", className)} />
    </div>
  );
};
