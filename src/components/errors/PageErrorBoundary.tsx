
import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorFallback from '@/components/errors/ErrorFallback';

interface PageErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
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

  static getDerivedStateFromError(error: Error): PageErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Update state with error details
    this.setState({
      errorInfo
    });

    // Log the error to console
    console.error('Error caught by PageErrorBoundary:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          componentStack={this.state.errorInfo?.componentStack || ''}
          resetErrorBoundary={() => {
            this.setState({
              hasError: false,
              error: null,
              errorInfo: null
            });
          }}
        />
      );
    }

    return this.props.children;
  }
}

export default PageErrorBoundary;
