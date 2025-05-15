
import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorFallback from './ErrorFallback';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
  onError?: (error: Error, info: ErrorInfo) => void;
  onReset?: () => void;
  showToast?: boolean;
  showLog?: boolean;
  errorTitle?: string;
  errorDescription?: string;
  customMessage?: string;
  logLevel?: 'info' | 'warning' | 'error';
  hideResetButton?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Base ErrorBoundary component that catches JavaScript errors in its child component tree and:
 * 1. Displays a fallback UI instead of the component tree that crashed
 * 2. Logs the error to the system logs
 * 3. Shows a toast notification
 * 4. Provides a way to recover (reset) from the error
 */
class ErrorBoundaryBase extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const { onError, showLog = true, customMessage, logLevel = 'error' } = this.props;

    if (showLog) {
      // Log to system logs
      logSystemEvent(
        'ui', 
        logLevel, 
        {
          error_type: error.name,
          error_message: error.message,
          component_stack: info.componentStack,
          stack: error.stack,
          description: customMessage || 'Error caught by ErrorBoundary'
        }
      ).catch(console.error);
    }

    // Call custom error handler if provided
    if (onError) {
      onError(error, info);
    }
  }

  resetErrorBoundary = () => {
    const { onReset } = this.props;
    
    if (onReset) {
      onReset();
    }
    
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { 
      children, 
      fallback: FallbackComponent, 
      showToast, 
      errorTitle, 
      errorDescription,
      customMessage,
      hideResetButton,
      logLevel
    } = this.props;
    const { hasError, error } = this.state;

    if (hasError && error) {
      if (FallbackComponent) {
        return <FallbackComponent error={error} resetErrorBoundary={this.resetErrorBoundary} />;
      }

      return (
        <ErrorFallback
          error={error}
          resetErrorBoundary={this.resetErrorBoundary}
          showToast={showToast}
          showLog={false} // Already logged in componentDidCatch
          title={errorTitle}
          description={errorDescription}
          customMessage={customMessage}
          logLevel={logLevel}
          hideResetButton={hideResetButton}
        />
      );
    }

    return children;
  }
}

export default ErrorBoundaryBase;
