
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { AsyncDataRenderer } from "@/components/ui/async-data-renderer";

export const RetryMechanismExample = () => {
  const [data, setData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Always fail on first try, succeed on retry
      if (retryCount === 0) {
        throw new Error("Simulated network failure. Try again!");
      }
      
      const result = "Data successfully loaded after retry";
      setData(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchData().catch(() => {
      // Error is already set in fetchData
    });
  };
  
  const handleInitialFetch = () => {
    setRetryCount(0);
    setData(null);
    fetchData().catch(() => {
      // Error is already set in fetchData
    });
  };

  const renderData = (content: string) => {
    return (
      <div className="p-4 border rounded bg-green-50 dark:bg-green-900/20">
        <p>{content}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Loaded after {retryCount} {retryCount === 1 ? 'retry' : 'retries'}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Retry Mechanism Example</h3>
        <Button onClick={handleInitialFetch}>Fetch Data</Button>
      </div>
      
      <div className="border rounded-md p-4">
        <AsyncDataRenderer
          data={data}
          isLoading={isLoading}
          error={error}
          onRetry={handleRetry}
          renderData={renderData}
          loadingText="Fetching data..."
        />
      </div>
      
      <div className="text-sm text-muted-foreground">
        <p>This example demonstrates a retry mechanism for handling transient errors:</p>
        <ol className="list-decimal pl-5 mt-2 space-y-1">
          <li>Click "Fetch Data" to simulate a failed request</li>
          <li>Use the retry button to attempt the request again</li>
          <li>The second attempt will succeed</li>
        </ol>
      </div>
    </div>
  );
};

export default RetryMechanismExample;
