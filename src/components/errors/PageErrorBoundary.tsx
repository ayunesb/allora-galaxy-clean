
import React, { Component, ErrorInfo } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorFallbackProps {
  error: Error | null;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertCircle className="mr-2 h-5 w-5" />
            Something went wrong
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>We apologize for the inconvenience. An error occurred while loading this page.</p>
          {error && (
            <div className="rounded bg-muted/50 p-2 text-xs font-mono overflow-auto">
              {error.message}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

interface PageErrorBoundaryProps {
  children: React.ReactNode;
}

interface PageErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class PageErrorBoundary extends Component<PageErrorBoundaryProps, PageErrorBoundaryState> {
  constructor(props: PageErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<PageErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      errorInfo
    });
    console.error('Error caught by PageErrorBoundary:', error, errorInfo);
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
    const { children } = this.props;

    if (hasError) {
      return (
        <ErrorFallback 
          error={error} 
          resetErrorBoundary={this.resetErrorBoundary} 
        />
      );
    }

    return children;
  }
}

export default PageErrorBoundary;
