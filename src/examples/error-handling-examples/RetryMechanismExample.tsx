
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import RetryFeedback from '@/components/ui/retry-feedback';
import ErrorState from '@/components/ui/error-state';
import { withRetry } from '@/lib/errors/retryUtils';
import { AsyncDataRenderer } from '@/components/ui/async-data-renderer';

// Example showing retry mechanisms in action
const RetryMechanismExample = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const maxRetries = 3;
  const initialDelay = 1000;
  
  // Simulated API call that fails a configurable number of times
  const simulateApiCall = async (failCount: number = 2): Promise<string> => {
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (failCount > 0) {
      throw new Error(`Simulated failure #${failCount}`);
    }
    
    return "API call successful after retries!";
  };
  
  // Manual implementation of retry logic for demonstration
  const handleFetchWithRetry = async () => {
    setIsLoading(true);
    setIsError(false);
    setData(null);
    setRetryCount(0);
    setIsRetrying(false);
    
    let failuresRemaining = 2; // Will succeed on 3rd try
    
    try {
      const result = await withRetry(
        async () => {
          const result = await simulateApiCall(failuresRemaining);
          failuresRemaining--;
          return result;
        },
        {
          maxRetries,
          initialDelay,
          onRetry: (_, attempt) => {
            setRetryCount(attempt);
            setIsRetrying(true);
          }
        }
      );
      
      setData(result);
      setIsRetrying(false);
    } catch (error) {
      setIsError(true);
      setIsRetrying(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset everything
  const handleReset = () => {
    setIsLoading(false);
    setIsError(false);
    setData(null);
    setRetryCount(0);
    setIsRetrying(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Retry Mechanism Demo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm">
            This demo shows automatic retry with exponential backoff. The first two attempts will 
            fail, but the third should succeed. Watch the retry feedback as it happens.
          </p>
          
          <div className="flex space-x-2">
            <Button onClick={handleFetchWithRetry} disabled={isLoading || isRetrying}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Start Demo
            </Button>
            
            <Button variant="outline" onClick={handleReset} disabled={isLoading || isRetrying}>
              Reset
            </Button>
          </div>
          
          <AsyncDataRenderer
            data={data}
            isLoading={isLoading}
            isError={isError}
            error={isError ? new Error("Failed after maximum retry attempts") : null}
            onRetry={handleFetchWithRetry}
            retryCount={retryCount}
            maxRetries={maxRetries}
            isRetrying={isRetrying}
            loadingText="Processing request..."
            preserveHeight={true}
          >
            {(data) => (
              <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
                <p className="text-green-800 dark:text-green-300">{data}</p>
              </div>
            )}
          </AsyncDataRenderer>
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        This example demonstrates the retry pattern with visual feedback to users.
      </CardFooter>
    </Card>
  );
};

export default RetryMechanismExample;
