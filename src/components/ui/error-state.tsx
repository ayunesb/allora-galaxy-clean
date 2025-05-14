
import React from 'react';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

export interface ErrorStateProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  title,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-6 text-center ${className}`}>
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
        <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
};

export default ErrorState;
