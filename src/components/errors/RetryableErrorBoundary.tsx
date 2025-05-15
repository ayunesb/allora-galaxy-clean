
import React, { Component, ComponentType, ReactNode, ErrorInfo } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './ErrorFallback';

export interface RetryableErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  tenantId?: string;
  moduleName?: string;
  onReset?: () => void;
  onError?: (error: Error, info: ErrorInfo) => void;
  FallbackComponent?: ComponentType<any>;
}

export interface RetryableErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary component with retry functionality
 */
export class RetryableErrorBoundary extends Component<RetryableErrorBoundaryProps, RetryableErrorBoundaryState> {
  constructor(props: RetryableErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error('Error caught by RetryableErrorBoundary:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    const { children, fallback, tenantId, moduleName, FallbackComponent } = this.props;
    
    if (this.state.hasError) {
      if (fallback) {
        return fallback;
      }
      
      if (FallbackComponent) {
        return <FallbackComponent 
          error={this.state.error} 
          resetErrorBoundary={this.handleRetry} 
          tenantId={tenantId} 
        />;
      }
      
      return (
        <ErrorFallback 
          error={this.state.error} 
          resetErrorBoundary={this.handleRetry}
          tenantId={tenantId}
          moduleName={moduleName}
        />
      );
    }
    
    return children;
  }
}

/**
 * Higher-order component that wraps a component in a RetryableErrorBoundary
 */
export function withRetryableErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    fallback?: ReactNode;
    tenantId?: string;
    moduleName?: string;
    onError?: (error: Error, info: ErrorInfo) => void;
    FallbackComponent?: ComponentType<any>;
  } = {}
): React.FC<P> {
  return function WithRetryableErrorBoundary(props: P) {
    return (
      <RetryableErrorBoundary
        fallback={options.fallback}
        tenantId={options.tenantId}
        moduleName={options.moduleName}
        onError={options.onError}
        FallbackComponent={options.FallbackComponent}
      >
        <Component {...props} />
      </RetryableErrorBoundary>
    );
  };
}

/**
 * Modern error boundary that uses React Error Boundary library
 */
export const ErrorBoundary: React.FC<RetryableErrorBoundaryProps> = ({
  children,
  fallback,
  tenantId,
  moduleName,
  onReset,
  onError,
  FallbackComponent
}) => {
  const handleError = (error: Error, info: ErrorInfo) => {
    console.error('Error caught by ErrorBoundary:', error, info);
    if (onError) {
      onError(error, info);
    }
  };

  return (
    <ReactErrorBoundary
      onError={handleError}
      onReset={onReset}
      fallbackRender={({ error, resetErrorBoundary }) => {
        if (fallback) {
          return <>{fallback}</>;
        }
        
        if (FallbackComponent) {
          return <FallbackComponent 
            error={error} 
            resetErrorBoundary={resetErrorBoundary} 
            tenantId={tenantId} 
          />;
        }
        
        return (
          <ErrorFallback 
            error={error} 
            resetErrorBoundary={resetErrorBoundary}
            tenantId={tenantId}
            moduleName={moduleName}
          />
        );
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default withRetryableErrorBoundary;
