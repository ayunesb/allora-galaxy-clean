
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface AsyncFieldProps {
  isLoading?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * AsyncField - A component that shows a loading skeleton or fallback while data is loading
 */
export const AsyncField: React.FC<AsyncFieldProps> = ({
  isLoading = false,
  fallback,
  children,
  className = "",
}) => {
  if (isLoading) {
    return fallback || <Skeleton className={`h-6 w-full ${className}`} />;
  }

  return <div className={className}>{children}</div>;
};

export default AsyncField;
