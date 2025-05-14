
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import ErrorFallback from './ErrorFallback';

interface PageErrorBoundaryProps {
  children: React.ReactNode;
}

const PageErrorBoundary: React.FC<PageErrorBoundaryProps> = ({ children }) => {
  const navigate = useNavigate();

  const handleReset = () => {
    // Navigate to home page when error boundary is reset from page level
    navigate('/');
  };

  return (
    <ErrorBoundary
      fallback={
        <ErrorFallback
          error={new Error("An error occurred in this page")}
          resetErrorBoundary={handleReset}
          supportEmail="support@allora.io"
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
};

export default PageErrorBoundary;
