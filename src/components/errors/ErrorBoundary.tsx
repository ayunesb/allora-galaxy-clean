
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { handleError } from '@/lib/errors/ErrorHandler';
import ErrorFallback from './ErrorFallback';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  module?: string;
  tenantId?: string;
  showNotification?: boolean;
  logToSystem?: boolean;
  level?: 'page' | 'section' | 'component';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static defaultProps = {
    showNotification: true,
    logToSystem: true,
    level: 'component',
    module: 'ui'
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { 
      hasError: true, 
      error, 
      errorInfo: null 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Update state with errorInfo
    this.setState({ errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log the error using our error handling system
    handleError(error, {
      context: {
        componentStack: errorInfo.componentStack,
        level: this.props.level
      },
      showNotification: this.props.showNotification,
      logToSystem: this.props.logToSystem,
      tenantId: this.props.tenantId,
      module: this.props.module
    });
  }

  resetError = (): void => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  }

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    
    if (hasError && error) {
      // Custom fallback prop as a function
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(error, this.resetError);
      }
      
      // Custom fallback prop as a component
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default error fallback
      return (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          resetErrorBoundary={this.resetError}
          tenant_id={this.props.tenantId}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Convenience HOC for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const ComponentWithErrorBoundary = (props: P) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
  
  ComponentWithErrorBoundary.displayName = `WithErrorBoundary(${displayName})`;
  
  return ComponentWithErrorBoundary;
}
