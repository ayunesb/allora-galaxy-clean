
import React from 'react';
import { ErrorState } from './ErrorState';

export interface EdgeFunctionErrorProps {
  error: Error & {
    statusCode?: number;
    code?: string;
    details?: any;
    requestId?: string;
    timestamp?: string;
  };
  retry?: () => void;
  showDetails?: boolean;
  showRequestId?: boolean;
}

/**
 * Specialized error component for edge function errors
 */
export const EdgeFunctionError: React.FC<EdgeFunctionErrorProps> = ({
  error,
  retry,
  showDetails = false,
  showRequestId = true,
}) => {
  const requestId = error.requestId || 'unknown';
  const statusCode = error.statusCode || 500;
  const errorCode = error.code || 'UNKNOWN_ERROR';
  
  // Get appropriate error message based on status code
  const getErrorTitle = () => {
    switch (statusCode) {
      case 400:
        return 'Bad Request';
      case 401:
        return 'Unauthorized';
      case 403:
        return 'Forbidden';
      case 404:
        return 'Not Found';
      case 429:
        return 'Too Many Requests';
      case 500:
        return 'Server Error';
      default:
        return 'Request Error';
    }
  };

  return (
    <ErrorState
      title={getErrorTitle()}
      message={error.message || "There was an error processing your request."}
      error={showDetails ? error : undefined}
      retry={retry}
      showDetails={showDetails}
    >
      {showRequestId && (
        <div className="mt-2 text-xs text-muted-foreground">
          Request ID: <code className="font-mono">{requestId}</code>
          {errorCode && (
            <>
              <span className="mx-1">•</span>
              Error Code: <code className="font-mono">{errorCode}</code>
            </>
          )}
        </div>
      )}
    </ErrorState>
  );
};

/**
 * Higher-order component to wrap a component with edge function error handling
 */
export function withEdgeFunctionErrorHandling<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    fallbackUI?: React.ReactNode;
    showDetails?: boolean;
    showRequestId?: boolean;
  } = {}
) {
  return function WithEdgeFunctionErrorHandling(props: P & { error?: any; retry?: () => void }) {
    const { error, retry, ...rest } = props;
    
    if (error) {
      return options.fallbackUI || (
        <EdgeFunctionError
          error={error}
          retry={retry}
          showDetails={options.showDetails}
          showRequestId={options.showRequestId}
        />
      );
    }
    
    return <Component {...rest as P} />;
  };
}

export default EdgeFunctionError;
