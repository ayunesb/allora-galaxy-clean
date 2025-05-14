
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EdgeFunctionHandler } from '@/components/errors/EdgeFunctionHandler';

const RetryMechanismExample: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);
  
  const handleRetry = () => {
    setIsLoading(true);
    setRetryCount(prev => prev + 1);
    
    // Simulate retry
    setTimeout(() => {
      if (retryCount < 2) {
        setError(new Error("Retry failed, please try again"));
      } else {
        setError(null);
      }
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Retry Mechanism Example</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={() => {
            setIsLoading(true);
            setTimeout(() => {
              setError(new Error("Example error to demonstrate retry mechanism"));
              setIsLoading(false);
            }, 1000);
          }}
          disabled={isLoading}
        >
          Trigger Error
        </Button>
        
        <div className="mt-4">
          <EdgeFunctionHandler
            isLoading={isLoading}
            error={error}
            onRetry={handleRetry}
            retryCount={retryCount}
            maxRetries={3}
            showDetails={true}
          >
            <p>Success! The operation completed without errors.</p>
          </EdgeFunctionHandler>
        </div>
      </CardContent>
    </Card>
  );
};

export default RetryMechanismExample;
