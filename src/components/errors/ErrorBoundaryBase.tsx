
import { Component, ErrorInfo, ReactNode } from 'react';

export interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

interface ErrorBoundaryPropsWithFallback {
  fallback: ReactNode;
  fallbackRender?: never;
  FallbackComponent?: never;
  onError?: (error: Error, info: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: any[];
  children?: ReactNode;
}

interface ErrorBoundaryPropsWithRenderFallback {
  fallback?: never;
  fallbackRender: (props: FallbackProps) => ReactNode;
  FallbackComponent?: never;
  onError?: (error: Error, info: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: any[];
  children?: ReactNode;
}

interface ErrorBoundaryPropsWithFallbackComponent {
  fallback?: never;
  fallbackRender?: never;
  FallbackComponent: React.ComponentType<FallbackProps>;
  onError?: (error: Error, info: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: any[];
  children?: ReactNode;
}

export type ErrorBoundaryProps = 
  | ErrorBoundaryPropsWithFallback 
  | ErrorBoundaryPropsWithRenderFallback 
  | ErrorBoundaryPropsWithFallbackComponent;

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * A class component that catches JavaScript errors anywhere in its child
 * component tree, logs those errors, and displays a fallback UI.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  state: ErrorBoundaryState = { hasError: false, error: null };
  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, info);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (this.state.hasError) {
      const { resetKeys = [] } = this.props;
      const { resetKeys: prevResetKeys = [] } = prevProps;
      
      if (
        resetKeys.length > 0 &&
        resetKeys.some((key, idx) => key !== prevResetKeys[idx])
      ) {
        this.resetErrorBoundary();
      }
    }
  }

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { fallback, fallbackRender, FallbackComponent, children } = this.props;

    if (hasError && error != null) {
      const fallbackProps: FallbackProps = {
        error,
        resetErrorBoundary: this.resetErrorBoundary,
      };
      
      if (React.isValidElement(fallback)) {
        return fallback;
      }
      
      if (typeof fallbackRender === 'function') {
        return fallbackRender(fallbackProps);
      }
      
      if (FallbackComponent) {
        return <FallbackComponent {...fallbackProps} />;
      }
      
      return (
        <div role="alert">
          <p>Something went wrong:</p>
          <pre style={{ color: 'red' }}>{error.message}</pre>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
