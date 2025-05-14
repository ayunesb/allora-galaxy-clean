import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RetryableErrorBoundary, ErrorState } from '@/lib/errors';

// Component that throws an error
const BuggyCounter = () => {
  const [counter, setCounter] = useState(0);
  
  const handleClick = () => {
    setCounter(prevCounter => prevCounter + 1);
  };
  
  // This will cause a render error when counter reaches 5
  if (counter === 5) {
    throw new Error("Simulated error: Counter reached 5!");
  }
  
  return (
    <div className="text-center p-6">
      <h3 className="text-lg font-medium mb-2">Counter: {counter}</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        {counter < 4 
          ? `${5 - counter} more clicks until error` 
          : "Next click will trigger an error!"}
      </p>
      <Button onClick={handleClick}>Increment Counter</Button>
    </div>
  );
};

export default function CustomErrorBoundaryExample() {
  const [key, setKey] = useState(0);
  
  // Reset the error boundary by changing its key
  const handleReset = () => {
    setKey(prevKey => prevKey + 1);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Error Boundary Example</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            This example demonstrates how to use a custom error boundary to catch and handle component errors.
            Click the counter until it reaches 5 to trigger an error.
          </p>
          
          <div className="border rounded-md">
            <RetryableErrorBoundary 
              key={key}
              onReset={handleReset}
            >
              <BuggyCounter />
            </RetryableErrorBoundary>
          </div>
          
          <div className="text-sm space-y-1 text-muted-foreground">
            <p>How it works:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>The error boundary catches errors during rendering</li>
              <li>It displays a fallback UI when an error occurs</li>
              <li>Provides a mechanism to recover from the error</li>
              <li>Logs the error to our monitoring system</li>
            </ul>
          </div>
          
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset Example
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
