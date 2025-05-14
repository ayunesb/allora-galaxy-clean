import React from "react";

export interface DataStateHandlerProps<T> {
  isLoading?: boolean;
  data: T | null;
  error: any;
  className?: string;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  emptyCondition?: boolean;
  children: React.ReactNode;
}

/**
 * DataStateHandler - A component to handle loading, error, and empty states for data fetching
 */
export const DataStateHandler = <T,>({
  isLoading = false,
  data,
  error,
  className = "",
  loadingComponent,
  errorComponent,
  emptyComponent,
  emptyCondition,
  children,
}: DataStateHandlerProps<T>) => {
  // Show loading state
  if (isLoading) {
    return loadingComponent || <p>Loading...</p>;
  }

  // Show error state
  if (error) {
    return errorComponent || <p>Error: {error.message}</p>;
  }

  // Show empty state if emptyCondition is true or data is empty
  if (emptyCondition || !data) {
    return emptyComponent || <p>No data available</p>;
  }

  // Default case: render children with data
  return <div className={className}>{children}</div>;
};

export interface PartialDataStateHandlerProps<T> {
  isLoading?: boolean;
  data?: T | null;
  error?: any;
  className?: string;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  emptyCondition?: boolean;
  children?: React.ReactNode;
}

export const PartialDataStateHandler = <T,>({
  isLoading = false,
  data,
  error = null,
  className = "",
  loadingComponent,
  errorComponent,
  emptyComponent,
  emptyCondition,
  children,
}: PartialDataStateHandlerProps<T>) => {
  // If there's no data, return null if no empty component is provided
  if (!data && !isLoading && !error && !emptyCondition && !emptyComponent) {
    return null;
  }
  
  // Show loading state
  if (isLoading) {
    return loadingComponent || <p>Loading...</p>;
  }
  
  // Show error state
  if (error) {
    return errorComponent || <p>Error: {error.message}</p>;
  }
  
  // Show empty state if emptyCondition is true or data is empty
  if (emptyCondition || !data) {
    return emptyComponent || <p>No data available</p>;
  }
  
  // Default case: render children with data
  return <div className={className}>{children}</div>;
};
