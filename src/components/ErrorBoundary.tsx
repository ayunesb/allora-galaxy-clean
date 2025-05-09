
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, info);
    
    // Call onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, info);
    }

    // Log to error reporting service or analytics
    this.logError(error, info);
  }

  logError(error: Error, info: ErrorInfo): void {
    // Example implementation - replace with actual error logging
    console.group('Error Details:');
    console.error(error.message);
    console.error('Component Stack:', info.componentStack);
    console.groupEnd();

    // Show toast notification
    toast({
      title: 'An error occurred',
      description: error.message || 'The application encountered an unexpected error',
      variant: 'destructive',
    });
  }

  reset = (): void => {
    // Reset the error state
    this.setState({
      hasError: false,
      error: null,
    });

    // Call onReset prop if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Show custom fallback UI if provided, otherwise default error UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-6 bg-muted/30 rounded-lg border border-muted">
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4 text-center max-w-md">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button onClick={this.reset}>Try again</Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
