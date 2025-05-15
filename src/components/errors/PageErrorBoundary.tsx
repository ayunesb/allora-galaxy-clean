
import React, { ComponentType } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './ErrorFallback';

export interface PageErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  tenantId?: string;
  moduleName?: string;
  FallbackComponent?: ComponentType<any>;
  showDetails?: boolean;
}

/**
 * Error boundary component for pages
 */
const PageErrorBoundary: React.FC<PageErrorBoundaryProps> = ({
  children,
  fallback,
  tenantId,
  moduleName,
  FallbackComponent,
  showDetails = false,
}) => {
  const handleError = (error: Error, info: { componentStack: string }) => {
    console.error('Error caught by PageErrorBoundary:', error);
    console.error('Component stack:', info.componentStack);
    
    // Log to monitoring system in production
    if (process.env.NODE_ENV === 'production') {
      // Add your error reporting logic here
    }
  };

  return (
    <ErrorBoundary
      FallbackComponent={FallbackComponent || 
        ((props) => <ErrorFallback {...props} tenantId={tenantId} moduleName={moduleName} showDetails={showDetails} />)
      }
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
};

export default PageErrorBoundary;
