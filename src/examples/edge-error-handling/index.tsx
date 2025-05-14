
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EdgeFunctionError } from '@/components/errors/EdgeFunctionErrorHandler';
import { RetryableErrorBoundary } from '@/lib/errors';

// Example component for demonstrating edge function error patterns
export const EdgeFunctionErrorPatterns = () => {
  const [errorType, setErrorType] = useState<string>('auth');
  
  const mockError = {
    message: errorType === 'auth' 
      ? 'Authentication failed' 
      : errorType === 'validation' 
        ? 'Invalid parameters' 
        : 'Internal server error',
    status: errorType === 'auth' 
      ? 401 
      : errorType === 'validation' 
        ? 400 
        : 500,
    requestId: 'mock-request-123',
    code: errorType === 'auth' 
      ? 'AUTH_ERROR' 
      : errorType === 'validation' 
        ? 'VALIDATION_ERROR' 
        : 'SERVER_ERROR',
    details: errorType === 'validation' 
      ? { fields: { name: 'Name is required' } } 
      : undefined
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edge Function Error Patterns</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant={errorType === 'auth' ? 'default' : 'outline'} 
            onClick={() => setErrorType('auth')}
          >
            Auth Error
          </Button>
          <Button 
            size="sm" 
            variant={errorType === 'validation' ? 'default' : 'outline'} 
            onClick={() => setErrorType('validation')}
          >
            Validation Error
          </Button>
          <Button 
            size="sm" 
            variant={errorType === 'server' ? 'default' : 'outline'} 
            onClick={() => setErrorType('server')}
          >
            Server Error
          </Button>
        </div>
        
        <EdgeFunctionError
          error={mockError}
          retry={() => alert('Retry clicked')}
          showDetails={true}
          showRequestId={true}
        />
      </CardContent>
    </Card>
  );
};

// Example for demonstrating retry mechanisms
export const RetryMechanismExample = () => {
  const [retryCount, setRetryCount] = useState(0);
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Retry Mechanism Example</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert>
            <AlertTitle>Retry Count: {retryCount}</AlertTitle>
            <AlertDescription>
              Demonstrating how retry mechanisms work with built-in state tracking.
            </AlertDescription>
          </Alert>
          
          <Button onClick={handleRetry}>
            Simulate Retry
          </Button>
          
          {retryCount > 0 && (
            <div className="text-sm text-muted-foreground">
              {retryCount < 3 
                ? `Retried ${retryCount} time(s). You can retry up to 3 times.` 
                : 'Maximum retry count reached. Please contact support.'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Example for demonstrating custom error boundary usage
export const CustomErrorBoundaryExample = () => {
  const [shouldThrow, setShouldThrow] = useState(false);
  
  // Component that throws an error when shouldThrow is true
  const ThrowingComponent = () => {
    if (shouldThrow) {
      throw new Error('This is a simulated error for demonstration.');
    }
    return <div className="p-4 bg-green-50 text-green-700 rounded">Component is working normally.</div>;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Error Boundary Example</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={() => setShouldThrow(!shouldThrow)} 
            variant={shouldThrow ? "default" : "outline"}
          >
            {shouldThrow ? 'Fix Error' : 'Trigger Error'}
          </Button>
          
          <RetryableErrorBoundary>
            <ThrowingComponent />
          </RetryableErrorBoundary>
        </div>
      </CardContent>
    </Card>
  );
};

export default { 
  EdgeFunctionErrorPatterns, 
  RetryMechanismExample, 
  CustomErrorBoundaryExample 
};
