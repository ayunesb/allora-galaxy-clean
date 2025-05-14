
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseDataStateOptions<T> {
  initialData?: T;
  onError?: (error: Error) => void;
  showToast?: boolean;
  errorMessage?: string;
  loadingMessage?: string;
}

export const useDataState = <T>(options: UseDataStateOptions<T> = {}) => {
  const [data, setData] = useState<T | undefined>(options.initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  
  const {
    onError,
    showToast = true,
    errorMessage = 'An error occurred while fetching data',
    loadingMessage = 'Loading data...',
  } = options;
  
  const fetchData = useCallback(async (
    fetchFunction: () => Promise<T>,
    transformFunction?: (data: T) => T
  ) => {
    setIsLoading(true);
    setError(null);
    
    let toastId: string | number | undefined;
    if (showToast) {
      toastId = toast({
        title: "Loading",
        description: loadingMessage,
      });
    }
    
    try {
      // Execute the fetch function
      const result = await fetchFunction();
      
      // Transform data if needed
      const transformedData = transformFunction ? transformFunction(result) : result;
      
      // Update state
      setData(transformedData);
      
      // Dismiss loading toast if it exists
      if (toastId && showToast) {
        toast({
          id: toastId,
          title: "Success",
          description: "Data loaded successfully",
          variant: "default",
        });
      }
      
      return transformedData;
    } catch (err) {
      // Handle error
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      
      if (toastId && showToast) {
        toast({
          id: toastId,
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      if (onError) {
        onError(error);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast, showToast, errorMessage, loadingMessage, onError]);
  
  return {
    data,
    setData,
    isLoading,
    error,
    fetchData,
  };
};

export default useDataState;
