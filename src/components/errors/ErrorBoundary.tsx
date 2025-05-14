import React, { Component, ErrorInfo } from 'react';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import ErrorFallback from './ErrorFallback';

interface Props {
  children: React.ReactNode;
  level?: 'section' | 'component' | 'page';
  fallback?: React.ReactElement;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  tenantId?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component to catch JavaScript errors in child component tree
 * and display a fallback UI instead of the component tree that crashed.
 */
class ErrorBoundary extends Component<Props, State> {
  public static defaultProps: Partial<Props> = {
    level: 'component',
    tenantId: 'system',
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the system logs
    const { level = 'component', tenantId = 'system', onError } = this.props;
    
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Update state with error details
    this.setState({ errorInfo });
    
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
      },
      tenantId
    ).catch(logError => {
      console.error('Failed to log error to system:', logError);
    });
  }
  
  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): React.ReactNode {
    const { children, fallback, level = 'component', tenantId = 'system' } = this.props;
    const { hasError, error, errorInfo } = this.state;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }
      
      // Otherwise use default error fallback
      return (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          resetErrorBoundary={this.resetErrorBoundary}
          tenantId={tenantId}
        />
      );
    }

    return children;
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
