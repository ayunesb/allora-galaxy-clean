import React, { Component, ErrorInfo } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";

export interface RetryableErrorBoundaryProps {
  children: React.ReactNode;
  maxRetries?: number;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onReset?: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  retryCount?: number;
  maxRetries?: number;
}

interface RetryableErrorBoundaryState {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

const DefaultFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  retryCount = 0,
  maxRetries = 3,
}) => {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>
        <div className="mb-4 text-sm">
          {error.message}
          {retryCount > 0 && (
            <div className="mt-1 text-xs opacity-80">
              Retry attempt {retryCount} of {maxRetries}
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => resetErrorBoundary()}
          disabled={retryCount >= maxRetries}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {retryCount >= maxRetries ? "Max retries reached" : "Retry"}
        </Button>
      </AlertDescription>
    </Alert>
  );
};

class RetryableErrorBoundary extends Component<
  RetryableErrorBoundaryProps,
  RetryableErrorBoundaryState
> {
  constructor(props: RetryableErrorBoundaryProps) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(
    error: Error,
  ): Partial<RetryableErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Call onError if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    console.error("Caught error:", error, errorInfo);
  }

  resetErrorBoundary = (): void => {
    const { maxRetries = 3, onReset } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      this.setState((state) => ({
        error: null,
        errorInfo: null,
        retryCount: state.retryCount + 1,
      }));

      // Call the onReset prop if provided
      if (onReset) {
        onReset();
      }
    }
  };

  render(): React.ReactNode {
    const { error, retryCount } = this.state;
    const {
      children,
      fallback: Fallback = DefaultFallback,
      maxRetries = 3,
    } = this.props;

    if (error) {
      return (
        <Fallback
          error={error}
          resetErrorBoundary={this.resetErrorBoundary}
          retryCount={retryCount}
          maxRetries={maxRetries}
        />
      );
    }

    return children;
  }
}

// Higher Order Component for wrapping components with RetryableErrorBoundary
export const withRetryableErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: Omit<RetryableErrorBoundaryProps, "children"> = {},
): React.FC<P> => {
  const WithRetryableErrorBoundary = (props: P) => (
    <RetryableErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </RetryableErrorBoundary>
  );

  const displayName = Component.displayName || Component.name || "Component";
  WithRetryableErrorBoundary.displayName = `withRetryableErrorBoundary(${displayName})`;

  return WithRetryableErrorBoundary;
};

export default RetryableErrorBoundary;
