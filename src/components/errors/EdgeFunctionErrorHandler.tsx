
import React from 'react';
import { EdgeFunctionErrorDisplay } from './EdgeFunctionErrorDisplay';

interface EdgeFunctionErrorHandlerProps {
  error: any;
  onRetry?: () => void;
  children?: React.ReactNode;
}

export const EdgeFunctionErrorHandler: React.FC<EdgeFunctionErrorHandlerProps> = ({
  error,
  onRetry,
  children
}) => {
  if (error) {
    return <EdgeFunctionErrorDisplay error={error} onRetry={onRetry} />;
  }

  return <>{children}</>;
};

export default EdgeFunctionErrorHandler;
