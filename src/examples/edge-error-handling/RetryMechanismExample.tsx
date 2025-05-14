import { useState } from 'react';
import { useRetry } from '@/lib/errors';
import { Button } from '@/components/ui/button';

const RetryMechanismExample = () => {
  const [data, setData] = useState<string | null>(null);
  const [fetchCount, setFetchCount] = useState(0);
  
  const fetchData = async () => {
    setFetchCount(prev => prev + 1);
    
    // Simulate a failing request for the first 2 attempts
    if (fetchCount < 3) {
      throw new Error('Failed to fetch data');
    }
    
    return 'Data fetched successfully!';
  };
  
  const { 
    retrying, 
    retry, 
    error, 
    retryCount, 
    maxRetries 
  } = useRetry(fetchData, {
    retries: 3,
    onError: (e) => console.error('Retry failed:', e)
  });
  
  return (
    <div className="space-y-4">
      <p>This example demonstrates a retry mechanism for handling errors.</p>
      
      {data ? (
        <p className="text-green-500">Data: {data}</p>
      ) : (
        <>
          {error && (
            <div className="text-red-500">
              Error: {error.message}
              <p>Retry Count: {retryCount} / {maxRetries}</p>
            </div>
          )}
          
          <Button 
            onClick={retry} 
            disabled={retrying}
          >
            {retrying ? 'Retrying...' : 'Retry'}
          </Button>
        </>
      )}
    </div>
  );
};

export default RetryMechanismExample;
