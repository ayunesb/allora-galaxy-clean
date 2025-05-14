
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RetryableErrorBoundary } from '@/components/errors';

const BuggyComponent: React.FC<{ shouldError: boolean }> = ({ shouldError }) => {
  if (shouldError) {
    throw new Error('This is a simulated error from the BuggyComponent');
  }
  
  return <div className="p-4 bg-muted/50 rounded-md">Component rendered successfully!</div>;
};

const CustomErrorBoundaryExample: React.FC = () => {
  const [shouldError, setShouldError] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Error Boundary Example</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          This example demonstrates how to use RetryableErrorBoundary to catch and recover from React errors.
        </p>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setShouldError(true)}
            variant="outline"
          >
            Trigger Error
          </Button>
          <Button 
            onClick={() => setShouldError(false)}
            variant="outline"
          >
            Reset
          </Button>
        </div>
        
        <div className="border rounded-md p-4 mt-4">
          <RetryableErrorBoundary
            onReset={() => setShouldError(false)}
          >
            <BuggyComponent shouldError={shouldError} />
          </RetryableErrorBoundary>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomErrorBoundaryExample;
