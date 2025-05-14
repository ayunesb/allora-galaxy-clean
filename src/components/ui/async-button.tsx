
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { handleError } from '@/lib/errors/ErrorHandler';
import { cn } from '@/lib/utils';

type ButtonProps = React.ComponentProps<typeof Button>;

export interface AsyncButtonProps extends Omit<ButtonProps, 'onClick'> {
  onClick: () => Promise<any>;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  showLoadingIcon?: boolean;
  resetDelay?: number;
  onError?: (error: Error) => void;
  onSuccess?: (result: any) => void;
  tenantId?: string;
  module?: string;
  children: React.ReactNode;
}

export const AsyncButton: React.FC<AsyncButtonProps> = ({
  onClick,
  loadingText,
  successText,
  errorText,
  showLoadingIcon = true,
  resetDelay = 2000,
  onError,
  onSuccess,
  disabled,
  children,
  tenantId = 'system',
  module = 'ui',
  className,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent double clicks
    if (isLoading) return;
    
    // Update state
    setIsLoading(true);
    setStatus('loading');
    
    try {
      // Call the onClick handler
      const result = await onClick();
      
      // Update state
      setStatus('success');
      setResult(result);
      
      // Call success callback
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Reset after delay
      if (resetDelay > 0) {
        setTimeout(() => {
          setStatus('idle');
        }, resetDelay);
      }
      
      return result;
    } catch (error) {
      // Update state
      setStatus('error');
      
      // Handle the error
      const alloraError = await handleError(error, {
        tenantId,
        module,
        context: {
          buttonAction: true,
        },
      });
      
      // Call error callback
      if (onError) {
        onError(alloraError);
      }
      
      // Reset after delay
      if (resetDelay > 0) {
        setTimeout(() => {
          setStatus('idle');
        }, resetDelay);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Determine button text based on status
  const buttonText = status === 'loading' && loadingText
    ? loadingText
    : status === 'success' && successText
      ? successText
      : status === 'error' && errorText
        ? errorText
        : children;
  
  // Determine button variant based on status
  const buttonVariant = status === 'success'
    ? 'success'
    : status === 'error'
      ? 'destructive'
      : props.variant || 'default';
  
  return (
    <Button
      {...props}
      className={cn(
        status === 'success' && 'bg-green-600 hover:bg-green-700',
        className
      )}
      variant={buttonVariant as any}
      disabled={isLoading || disabled || status === 'success'}
      onClick={handleClick}
    >
      {status === 'loading' && showLoadingIcon && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {buttonText}
    </Button>
  );
};

export default AsyncButton;
