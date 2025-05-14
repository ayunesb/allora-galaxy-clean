
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EdgeFunctionHandler } from '@/components/errors/EdgeFunctionHandler';

const RetryMechanismExample: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const simulateRequest = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate an API call that might fail
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Randomly fail to demonstrate retry
      if (Math.random() > 0.5) {
        throw new Error('Simulated network failure. Try again!');
      }
      
      // Reset retry count on success
      setRetryCount(0);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    simulateRequest();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Retry Mechanism Example</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          This example demonstrates how to handle retries for failed API requests.
        </p>
        
        <div className="flex gap-2">
          <Button onClick={simulateRequest} disabled={isLoading}>
            Simulate API Request
          </Button>
          <Button variant="outline" onClick={() => { setError(null); setRetryCount(0); }}>
            Reset
          </Button>
        </div>
        
        <div className="border rounded-md p-4 mt-4">
          <EdgeFunctionHandler
            isLoading={isLoading}
            error={error}
            onRetry={handleRetry}
            showDetails={true}
            retryCount={retryCount}
            maxRetries={3}
          >
            <div className="p-4 bg-muted/50 rounded-md">
              <p>Request successful! Data loaded correctly.</p>
            </div>
          </EdgeFunctionHandler>
        </div>
      </CardContent>
    </Card>
  );
};

export default RetryMechanismExample;
