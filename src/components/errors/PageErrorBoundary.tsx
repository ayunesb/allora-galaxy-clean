
import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import ErrorFallback from './ErrorFallback';

interface PageErrorBoundaryProps {
  children: React.ReactNode;
  tenantId?: string;
}

/**
 * Error boundary specifically designed for page-level errors
 * Includes more prominent UI and potential recovery options
 */
const PageErrorBoundary: React.FC<PageErrorBoundaryProps> = ({ 
  children, 
  tenantId = 'system' 
}) => {
  return (
    <ErrorBoundary
      level="page"
      module="ui"
      tenantId={tenantId}
      fallback={(error, resetError) => (
        <ErrorFallback 
          error={error}
          resetErrorBoundary={resetError}
          supportEmail="support@alloraos.com"
          tenant_id={tenantId}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

export default PageErrorBoundary;
