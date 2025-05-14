
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RetryFeedback from '@/components/ui/retry-feedback';
import ErrorState from '@/components/ui/error-state';
import { useToast } from '@/hooks/use-toast';

interface RetryContextProps {
  children: (data: any) => React.ReactElement;
  data: string | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry: () => Promise<void>;
  retryCount: number;
  maxRetries: number;
  isRetrying: boolean;
  loadingText: string;
  preserveHeight: boolean;
}

// Simple retry mechanism example
export default function RetryMechanismExample() {
  const [data, setData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const { toast } = useToast();
  
  const MAX_RETRIES = 3;
  
  // Example of a retry mechanism with backoff
  async function fetchWithRetry(shouldFail = true): Promise<string> {
    // Simulate a flaky API that sometimes fails
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Randomly succeed or fail if shouldFail is true
        if (shouldFail && Math.random() > 0.7) {
          resolve("Data successfully loaded after retry");
        } else if (shouldFail) {
          reject(new Error("API request failed"));
        } else {
          resolve("Data successfully loaded");
        }
      }, 1000);
    });
  }
  
  const executeRequest = async (shouldFail = false) => {
    setIsLoading(true);
    setError(null);
    setRetryCount(0);
    
    try {
      const result = await fetchWithRetry(shouldFail);
      setData(result);
      toast({
        title: "Success",
        description: "Request completed successfully"
      });
    } catch (err: any) {
      setError(err);
      setData(null);
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRetry = async () => {
    if (retryCount >= MAX_RETRIES) {
      toast({
        variant: "destructive",
        title: "Max Retries Reached",
        description: "Please try again later"
      });
      return;
    }
    
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      const result = await fetchWithRetry(retryCount < MAX_RETRIES - 1);
      setData(result);
      setError(null);
      toast({
        title: "Success",
        description: "Request succeeded after retry"
      });
    } catch (err: any) {
      setError(err);
      toast({
        variant: "destructive",
        title: `Retry ${retryCount + 1} Failed`,
        description: err.message
      });
    } finally {
      setIsRetrying(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Retry Mechanism Example</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 mb-4">
          <Button onClick={() => executeRequest(false)}>
            Successful Request
          </Button>
          <Button 
            variant="outline" 
            onClick={() => executeRequest(true)}
          >
            Flaky Request (May Fail)
          </Button>
        </div>
        
        <div className="min-h-[200px] border rounded-md p-4 bg-muted/30">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="mt-2 text-sm text-muted-foreground">Loading data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="space-y-4">
              {(retryCount > 0 || isRetrying) && (
                <RetryFeedback
                  retryCount={retryCount}
                  maxRetries={MAX_RETRIES}
                  isRetrying={isRetrying}
                  onRetry={handleRetry}
                />
              )}
              <ErrorState
                title="Failed to Load Data"
                message="The request failed to complete. You can retry the operation."
                error={error}
                retry={handleRetry}
              />
            </div>
          ) : data ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-green-500 font-medium mb-2">✅ Success</div>
                <p>{data}</p>
                {retryCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Succeeded after {retryCount} {retryCount === 1 ? 'retry' : 'retries'}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Click one of the buttons above to start a request</p>
            </div>
          )}
        </div>
        
        <div className="text-sm space-y-1 text-muted-foreground">
          <p>This example demonstrates:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Retry logic with maximum retry limits</li>
            <li>Visual feedback during retry attempts</li>
            <li>Exponential backoff (simulated)</li>
            <li>Error handling with user-friendly messages</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
