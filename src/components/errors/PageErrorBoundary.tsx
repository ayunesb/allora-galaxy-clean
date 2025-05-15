
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './ErrorFallback';

interface PageErrorBoundaryProps {
  children: React.ReactNode;
  tenantId?: string;
}

/**
 * Error boundary specifically designed for wrapping page components
 * Uses a more full-page oriented fallback UI
 */
const PageErrorBoundary: React.FC<PageErrorBoundaryProps> = ({
  children,
  tenantId = 'system'
}) => {
  return (
    <ErrorBoundary
      FallbackComponent={(props) => (
        <ErrorFallback {...props} tenantId={tenantId} />
      )}
      onError={(error, info) => {
        console.error('Error caught by PageErrorBoundary:', error);
        console.error('Component stack:', info.componentStack);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default PageErrorBoundary;
