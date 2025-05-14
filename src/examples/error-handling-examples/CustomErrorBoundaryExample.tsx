
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RetryableErrorBoundary } from '@/lib/errors';

// Component that will throw an error when the button is clicked
const ErrorThrower = () => {
  const [shouldThrow, setShouldThrow] = useState(false);
  
  if (shouldThrow) {
    throw new Error("This is a deliberately thrown error for demonstration");
  }
  
  return (
    <div className="space-y-4">
      <p>Click the button below to trigger an error that will be caught by the error boundary:</p>
      <Button
        variant="destructive"
        onClick={() => setShouldThrow(true)}
      >
        Throw Error
      </Button>
    </div>
  );
};

// Custom fallback component for the error boundary
const CustomErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  return (
    <div className="p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-md">
      <h3 className="text-lg font-medium text-red-800 dark:text-red-300">Custom Error UI</h3>
      <p className="mt-2 text-red-700 dark:text-red-300">
        We've encountered an issue, but don't worry! Our custom error handler has it under control.
      </p>
      <div className="mt-3 bg-white dark:bg-black/20 p-2 rounded text-sm font-mono overflow-auto max-h-20">
        {error.message}
      </div>
      <div className="mt-4">
        <Button 
          size="sm" 
          onClick={resetErrorBoundary}
          variant="outline"
          className="bg-white dark:bg-black/20"
        >
          Reset Example
        </Button>
      </div>
    </div>
  );
};

// Example showing how to use a custom error boundary with error tracking
const CustomErrorBoundaryExample = () => {
  // Handler for when errors occur
  const handleError = (error: Error) => {
    console.error("Error caught by boundary:", error);
    
    // In a real application, you would log this to your error tracking system
    // Example: logSystemEvent('ui', 'error', { description: error.message });
  };
  
  const handleReset = () => {
    console.log("Error boundary was reset");
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Error Boundary Example</CardTitle>
      </CardHeader>
      <CardContent>
        <RetryableErrorBoundary
          onError={handleError}
          onReset={handleReset}
          fallback={<CustomErrorFallback error={new Error()} resetErrorBoundary={() => {}} />}
        >
          <ErrorThrower />
        </RetryableErrorBoundary>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        This example demonstrates a custom error boundary with a specialized error UI.
        The error is caught, logged, and a recovery mechanism is provided.
      </CardFooter>
    </Card>
  );
};

export default CustomErrorBoundaryExample;
