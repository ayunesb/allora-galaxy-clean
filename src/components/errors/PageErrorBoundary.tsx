
import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { AlertTriangle } from 'lucide-react';

interface PageErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  supportEmail?: string;
  tenantId: string;
}

/**
 * Error fallback for page-level errors - shows a user-friendly error page
 */
export const PageErrorFallback: React.FC<PageErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary, 
  supportEmail = 'support@allora.com',
  tenantId
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white shadow-lg rounded-lg">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Something went wrong</h2>
          <p className="mt-2 text-gray-600">
            We're sorry, but something unexpectedly went wrong. Our team has been notified.
          </p>
          <div className="mt-4 border p-4 rounded-md bg-gray-50 text-sm text-left overflow-auto max-h-32">
            <p className="text-red-600 font-mono">{error.message}</p>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              onClick={resetErrorBoundary}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Homepage
            </button>
          </div>
          <p className="mt-8 text-xs text-gray-500">
            If the problem persists, please contact our support team at{' '}
            <a href={`mailto:${supportEmail}`} className="text-blue-600 hover:underline">
              {supportEmail}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Page Error Boundary for catching errors at page level
 */
const PageErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      level="page"
      fallback={<PageErrorFallback error={new Error()} resetErrorBoundary={() => {}} tenantId="system" />}
    >
      {children}
    </ErrorBoundary>
  );
};

export default PageErrorBoundary;
