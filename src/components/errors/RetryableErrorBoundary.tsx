
import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { withRetry } from '@/lib/errors/retryUtils';

interface RetryableErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactElement;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
  tenantId?: string;
  retryDelay?: number;
  level?: 'section' | 'component' | 'page';
  shouldRetry?: (error: Error) => boolean;
}

/**
 * RetryableErrorBoundary - An error boundary that automatically retries rendering on certain errors
 */
class RetryableErrorBoundary extends React.Component<RetryableErrorBoundaryProps> {
  static defaultProps = {
    maxRetries: 1,
    retryDelay: 1000,
    shouldRetry: (error: Error) => true,
    tenantId: 'system',
    level: 'component',
  };

  state = {
    hasError: false,
    error: null as Error | null,
    errorInfo: null as React.ErrorInfo | null,
    retryCount: 0,
    lastError: null as Error | null,
    isRetrying: false,
  };

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const { onError, tenantId, level } = this.props;
    
    console.error('Error caught by RetryableErrorBoundary:', error, errorInfo);
    
    // Update state with error details
    this.setState({ 
      hasError: true, 
      error, 
      errorInfo,
      lastError: error,
    });
    
    // Call optional onError callback
    if (onError) {
      onError(error, errorInfo);
    }
    
    // Log to system
    logSystemEvent(
      'system',
      'error',
      {
        description: `React error boundary caught an error: ${error.message}`,
        error_message: error.message,
        error_name: error.name,
        error_stack: error.stack,
        component_stack: errorInfo.componentStack,
        boundary_level: level,
        retry_count: this.state.retryCount,
      },
      tenantId
    ).catch(logError => {
      console.error('Failed to log error to system:', logError);
    });
    
    // Attempt retry if conditions are met
    this.maybeRetry(error);
  }
  
  maybeRetry = (error: Error) => {
    const { maxRetries, retryDelay, shouldRetry } = this.props;
    const { retryCount } = this.state;
    
    if (retryCount < maxRetries! && shouldRetry!(error)) {
      this.setState({ isRetrying: true });
      
      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 200;
      const delay = retryDelay! * Math.pow(1.5, retryCount) + jitter;
      
      setTimeout(() => {
        this.setState({
          hasError: false,
          error: null,
          retryCount: retryCount + 1,
          isRetrying: false
        });
        
        logSystemEvent(
          'system',
          'info',
          {
            description: `Retrying after error (attempt ${retryCount + 1}/${maxRetries})`,
            error_message: error.message,
            retry_count: retryCount + 1,
          },
          this.props.tenantId
        ).catch(() => {});
        
      }, delay);
    }
  };
  
  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false
    });
  };

  render(): React.ReactNode {
    const { children, fallback } = this.props;
    const { hasError, error, errorInfo, isRetrying } = this.state;

    if (isRetrying) {
      return (
        <div className="p-4 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center space-x-3">
            <div className="animate-spin h-4 w-4 border-2 border-amber-600 dark:border-amber-400 rounded-full border-t-transparent" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Recovering from error...
            </p>
          </div>
        </div>
      );
    }

    if (hasError && error) {
      if (fallback) {
        return React.cloneElement(fallback, {
          error,
          errorInfo,
          resetErrorBoundary: this.resetErrorBoundary,
        });
      }
      
      // Use standard ErrorFallback from error system
      return (
        <ErrorBoundary.defaultProps.fallback 
          error={error} 
          errorInfo={errorInfo} 
          resetErrorBoundary={this.resetErrorBoundary} 
          tenantId={this.props.tenantId}
        />
      );
    }

    return children;
  }
}

export default RetryableErrorBoundary;

// HOC for wrapping components with retryable error boundaries
export function withRetryableErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: Omit<RetryableErrorBoundaryProps, 'children'>
): React.FC<P> {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const ComponentWithErrorBoundary = (props: P) => {
    return (
      <RetryableErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </RetryableErrorBoundary>
    );
  };
  
  ComponentWithErrorBoundary.displayName = `WithRetryableErrorBoundary(${displayName})`;
  
  return ComponentWithErrorBoundary;
}
