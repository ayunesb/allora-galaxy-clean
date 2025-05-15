
import React, { Component, ErrorInfo } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorBoundaryFallbackProps> | React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export interface ErrorBoundaryFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const DefaultFallback: React.FC<ErrorBoundaryFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  return (
    <Card className="border-destructive/50 bg-destructive/10">
      <CardHeader>
        <CardTitle className="flex items-center text-destructive">
          <AlertCircle className="mr-2 h-5 w-5" />
          Something went wrong
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>An error occurred while rendering this component.</p>
        <div className="rounded bg-muted/50 p-2 text-xs font-mono overflow-auto">
          {error.message}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </CardFooter>
    </Card>
  );
};

class ErrorBoundaryBase extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Store the error info for potential display
    this.setState({
      errorInfo
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log the error to the console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): React.ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // Handle both React component and ReactNode fallback types
      if (React.isValidElement(fallback)) {
        return fallback;
      } else if (typeof fallback === 'function') {
        const FallbackComponent = fallback as React.ComponentType<ErrorBoundaryFallbackProps>;
        return (
          <FallbackComponent 
            error={error} 
            resetErrorBoundary={this.resetErrorBoundary} 
          />
        );
      } else {
        return (
          <DefaultFallback 
            error={error} 
            resetErrorBoundary={this.resetErrorBoundary} 
          />
        );
      }
    }

    return children;
  }
}

export default ErrorBoundaryBase;
