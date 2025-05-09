
import { Component, ErrorInfo, ReactNode } from 'react';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import ErrorFallback from '@/components/ErrorFallback';
import { useToast } from '@/hooks/use-toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  tenant_id?: string;
  supportEmail?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnRouteChange?: boolean;
  logErrors?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * A component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends Component<Props, State> {
  public static defaultProps = {
    logErrors: true,
    resetOnRouteChange: true,
    supportEmail: 'support@alloraos.com'
  };
  
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to our logging service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Update state with error info for debugging
    this.setState({ errorInfo });
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log to system logs if tenant_id is available and logging is enabled
    if (this.props.tenant_id && this.props.logErrors) {
      this.logErrorToSystem(error, errorInfo);
    }
  }
  
  private logErrorToSystem(error: Error, errorInfo: ErrorInfo) {
    const eventData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      location: window.location.href,
      timestamp: new Date().toISOString()
    };
    
    logSystemEvent(
      'system',
      'error',
      eventData,
      this.props.tenant_id || 'system'
    ).catch(logError => {
      console.error("Failed to log system event:", logError);
      // Try to show toast notification as a fallback
      try {
        // Note: This is a workaround as React classes don't support hooks
        // In a real application, you might want to use a different approach
        const toastFn = useToast;
        const toast = toastFn();
        toast({
          title: "Error Logging Failed",
          description: "Could not log error details to system",
          variant: "destructive"
        });
      } catch (toastError) {
        console.error("Failed to show toast:", toastError);
      }
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  componentDidUpdate(prevProps: Props) {
    // Reset error state when route changes if resetOnRouteChange is true
    if (
      this.props.resetOnRouteChange &&
      this.state.hasError &&
      prevProps.children !== this.props.children
    ) {
      this.handleReset();
    }
  }

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Otherwise use our default error fallback
      return (
        <ErrorFallback 
          error={this.state.error || new Error('Unknown error')}
          errorInfo={this.state.errorInfo}
          resetErrorBoundary={this.handleReset}
          tenant_id={this.props.tenant_id}
          supportEmail={this.props.supportEmail}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
