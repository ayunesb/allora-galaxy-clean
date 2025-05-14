
import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import ErrorFallback from './ErrorFallback';

interface PageErrorBoundaryProps {
  children: React.ReactNode;
  tenantId?: string;
  module?: string;
}

/**
 * Specialized error boundary for page-level errors
 * Shows a user-friendly error page with navigation options
 */
const PageErrorBoundary: React.FC<PageErrorBoundaryProps> = ({ 
  children, 
  tenantId = 'system',
  module = 'page'
}) => {
  return (
    <ErrorBoundary
      level="page"
      tenantId={tenantId}
      module={module}
      fallback={(error, resetError) => (
        <ErrorFallback
          error={error}
          resetErrorBoundary={resetError}
          level="page"
          tenantId={tenantId}
          showHeader={true}
          showReport={true}
          showHomeButton={true}
          showRetry={true}
          title="We encountered a problem"
          description="Sorry, something went wrong while loading this page. You can try refreshing or return to the dashboard."
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

export default PageErrorBoundary;
