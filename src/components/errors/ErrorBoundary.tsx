
import React, { Component, ErrorInfo } from 'react';
import { reportErrorFromErrorBoundary } from '@/lib/telemetry/errorReporter';
import ErrorFallback from '@/components/ErrorFallback';
import type { ErrorFallbackProps } from '@/components/ErrorFallback';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  componentName?: string;
  tenantId?: string;
  showDetails?: boolean;
  maxRetries?: number;
  children: React.ReactNode;
}

/**
 * Error boundary component that catches errors in its child component tree
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Report to monitoring system
    reportErrorFromErrorBoundary(error, { 
      componentStack: errorInfo.componentStack || undefined 
    }, {
      module: 'ui',
      tenantId: this.props.tenantId,
      context: {
        componentName: this.props.componentName,
      }
    }).catch(reportingError => {
      console.error('Failed to report error:', reportingError);
    });
    
    this.setState({ errorInfo });
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetErrorBoundary = () => {
    this.setState(prevState => ({
      hasError: false,
      retryCount: prevState.retryCount + 1
    }));

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    const { hasError, error, retryCount } = this.state;
    const { children, fallback, componentName, showDetails, maxRetries = 3, tenantId } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Otherwise use default fallback
      return (
        <ErrorFallback
          error={error}
          resetErrorBoundary={this.resetErrorBoundary}
          componentName={componentName}
          showDetails={showDetails}
          retryCount={retryCount}
          maxRetries={maxRetries}
          tenantId={tenantId}
          componentStack={this.state.errorInfo?.componentStack}
        />
      );
    }

    return children;
  }
}

export default ErrorBoundary;
