
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface InlineErrorProps {
  message: string;
  details?: string;
  onRetry?: () => void;
  className?: string;
  showDetails?: boolean;
  icon?: React.ReactNode;
  variant?: 'default' | 'subtle';
}

/**
 * InlineError - A simple component for displaying inline errors
 * Useful for form validations, API errors, etc.
 */
const InlineError: React.FC<InlineErrorProps> = ({
  message,
  details,
  onRetry,
  className,
  showDetails = false,
  icon = <AlertTriangle className="h-4 w-4" />,
  variant = 'default'
}) => {
  const variantClasses = {
    default: "border border-destructive/50 bg-destructive/10 text-destructive",
    subtle: "bg-muted/50 text-muted-foreground"
  };
  
  return (
    <div className={cn(
      "rounded-md p-3 text-sm flex flex-col",
      variantClasses[variant],
      className
    )}>
      <div className="flex items-start">
        <div className="mr-2 mt-0.5">
          {icon}
        </div>
        <div className="flex-1">
          <p className="font-medium">{message}</p>
          
          {showDetails && details && (
            <p className="mt-1 text-xs opacity-90">{details}</p>
          )}
        </div>
      </div>
      
      {onRetry && (
        <div className="mt-2 flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRetry}
            className="h-7 px-2 text-xs"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default InlineError;
