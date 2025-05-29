import React, { useState, useEffect, useCallback, useMemo } from "react";
import EdgeFunctionErrorDisplay from "./EdgeFunctionErrorDisplay";
import { toast } from "@/lib/notifications/toast";

/**
 * Higher-order component that adds edge function error handling
 * @param WrappedComponent The component to wrap with error handling
 */
const withEdgeFunctionErrorHandling = <P,>(
  Component: React.ComponentType<P>,
): React.FC<P> => {
  return function WrappedComponent(props: P) {
    const [error, setError] = useState<Error | null>(null);

    // Memoize error handler to prevent recreation on each render
    const handleEdgeFunctionError = useCallback((err: Error) => {
      console.error("Edge function error caught by HOC:", err);

      // Show toast notification
      toast.error({
        title: "Edge Function Error",
        description: err.message || "An error occurred in the edge function",
      });

      // Set the error state to trigger error display
      setError(err);
    }, []);

    // Reset error if props change - memoize the deps array
    const propsSignature = JSON.stringify(props);
    useEffect(() => {
      setError(null);
    }, [propsSignature]);

    // Memoize the error display component to prevent unnecessary re-renders
    const ErrorComponent = useMemo(() => {
      if (!error) return null;
      return (
        <EdgeFunctionErrorDisplay
          error={error}
          onRetry={() => setError(null)}
        />
      );
    }, [error]);

    if (error) {
      return ErrorComponent;
    }

    return (
      <Component {...props} onEdgeFunctionError={handleEdgeFunctionError} />
    );
  };
};

export default withEdgeFunctionErrorHandling;
