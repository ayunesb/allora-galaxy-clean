
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRetry } from '@/lib/errors';
import { EdgeFunctionHandler } from '@/components/errors/EdgeFunctionHandler';
import { AsyncDataRenderer } from '@/components/ui/async-data-renderer';

const RetryMechanismExample = () => {
  const [error, setError] = useState<Error | null>(null);
  
  const makeRequest = useCallback(async (): Promise<string> => {
    // Simulate a request that sometimes fails
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Randomly succeed or fail
    const shouldFail = Math.random() < 0.7;
    
    if (shouldFail) {
      const error = new Error("Simulated network failure");
      throw error;
    }
    
    return "Request succeeded!";
  }, []);
  
  const handleError = useCallback((e: Error) => {
    setError(e);
    console.error("Operation failed:", e);
  }, []);
  
  const { 
    execute, 
    isLoading, 
    data: responseData, 
    retryCount, 
    maxRetries,
    isRetrying 
  } = useRetry({
    operation: makeRequest,
    onError: handleError,
    maxRetries: 3,
    retryDelay: 1000,
  });
  
  // Modified to use a render prop pattern instead of children prop
  const renderData = (data: string) => (
    <div className="p-4 bg-green-50 text-green-800 rounded-md">
      {data}
    </div>
  );
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Retry Mechanism Example</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 text-sm text-muted-foreground">
          <p>This example demonstrates automatic retry logic for unreliable operations.</p>
          <p>Click the button to make a request that has a 70% chance of failure. The system will automatically retry up to 3 times.</p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={execute} 
            disabled={isLoading || isRetrying}
          >
            {isLoading ? 'Making Request...' : 'Start Request'}
          </Button>
          
          <EdgeFunctionHandler
            isLoading={isLoading}
            error={error}
            onRetry={execute}
            retryCount={retryCount}
            maxRetries={maxRetries}
            isRetrying={isRetrying}
          >
            {responseData && (
              <AsyncDataRenderer
                data={responseData}
                isLoading={false}
                error={null}
                onRetry={execute}
                renderData={renderData}
                loadingText="Processing data..."
                preserveHeight={true}
              />
            )}
          </EdgeFunctionHandler>
        </div>
      </CardContent>
    </Card>
  );
};

export default RetryMechanismExample;
