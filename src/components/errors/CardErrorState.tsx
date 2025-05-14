
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export interface CardErrorStateProps {
  title?: string;
  message: string;
  error?: Error | string;
  onRetry?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  showHomeButton?: boolean;
  className?: string;
  showDetails?: boolean;
}

/**
 * CardErrorState - A card-style error component for contained UI sections
 */
const CardErrorState: React.FC<CardErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  error,
  onRetry,
  onAction,
  actionLabel,
  showHomeButton = false,
  className = '',
  showDetails = false,
}) => {
  const errorMessage = typeof error === 'string' ? error : error?.message;
  
  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full bg-destructive/10 p-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-medium mb-2">{title}</h3>
          <p className="text-muted-foreground">{message}</p>
          
          {showDetails && errorMessage && (
            <div className="w-full mt-4 p-3 bg-muted rounded-md text-xs font-mono text-left overflow-auto max-h-[100px]">
              {errorMessage}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-center gap-3 pt-2 pb-6">
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        )}
        
        {onAction && (
          <Button onClick={onAction}>
            {actionLabel || 'Continue'}
          </Button>
        )}
        
        {showHomeButton && (
          <Button variant="ghost" onClick={() => window.location.href = '/'}>
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CardErrorState;
