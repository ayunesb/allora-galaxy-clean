
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { EdgeFunctionHandler } from '@/components/errors/EdgeFunctionHandler';
import { processEdgeResponse, handleEdgeError } from '@/lib/errors/clientErrorHandler';
import { useToast } from '@/lib/notifications/toast';

// Error types supported by the demo error function
type ErrorType = 'none' | 'badRequest' | 'unauthorized' | 'forbidden' | 
                'notFound' | 'rateLimited' | 'serverError';

// ErrorType dropdown options
const errorTypeOptions = [
  { value: 'none', label: 'No Error (Success)' },
  { value: 'badRequest', label: '400 Bad Request' },
  { value: 'unauthorized', label: '401 Unauthorized' },
  { value: 'forbidden', label: '403 Forbidden' },
  { value: 'notFound', label: '404 Not Found' },
  { value: 'rateLimited', label: '429 Rate Limited' },
  { value: 'serverError', label: '500 Server Error' }
];

// Demo component for testing edge function error patterns
const EdgeFunctionErrorPatterns: React.FC = () => {
  const [errorType, setErrorType] = useState<ErrorType>('none');
  const [showDetails, setShowDetails] = useState(true);
  const [delay, setDelay] = useState(500);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  
  // Call edge function with selected error type
  const handleCallFunction = async () => {
    setIsLoading(true);
    setError(null);
    setData(null);
    
    try {
      console.log(`Calling demo-error-handling with errorType: ${errorType}, delay: ${delay}ms`);
      
      const response = await supabase.functions.invoke('demo-error-handling', {
        body: { 
          errorType: errorType,
          simulateDelay: delay
        }
      });
      
      const result = await processEdgeResponse(response);
      setData(result);
      toast.success("Function called successfully");
    } catch (err) {
      console.error("Edge function error:", err);
      setError(err);
      handleEdgeError(err, {
        showToast: false, // We'll show errors in the UI instead of a toast
        logToConsole: true
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle retry
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    handleCallFunction();
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Edge Function Error Handling Demo</CardTitle>
        <CardDescription>
          Test how the system handles different types of edge function errors
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="error-type">Error Type</Label>
          <Select 
            value={errorType} 
            onValueChange={(value) => setErrorType(value as ErrorType)}
          >
            <SelectTrigger id="error-type">
              <SelectValue placeholder="Select error type" />
            </SelectTrigger>
            <SelectContent>
              {errorTypeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Response Delay: {delay}ms</Label>
          </div>
          <Slider
            value={[delay]}
            min={0}
            max={3000}
            step={100}
            onValueChange={(value) => setDelay(value[0])}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="show-details"
            checked={showDetails}
            onChange={() => setShowDetails(!showDetails)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="show-details">Show detailed error information</Label>
        </div>
        
        <Button onClick={handleCallFunction} disabled={isLoading}>
          Call Edge Function
        </Button>
        
        <div className="border rounded-md p-4">
          <EdgeFunctionHandler
            isLoading={isLoading}
            error={error}
            onRetry={handleRetry}
            showDetails={showDetails}
            loadingText="Calling edge function..."
            retryCount={retryCount}
            maxRetries={3}
          >
            <div className="space-y-2">
              <h3 className="font-medium">Response Data:</h3>
              <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-60">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </EdgeFunctionHandler>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
        This example uses the demo-error-handling edge function to simulate various error scenarios
      </CardFooter>
    </Card>
  );
};

export default EdgeFunctionErrorPatterns;
