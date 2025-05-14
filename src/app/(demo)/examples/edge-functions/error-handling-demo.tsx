
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EdgeFunctionError } from '@/components/errors/EdgeFunctionErrorDisplay';
import { Loader } from 'lucide-react';

interface ErrorDemoState {
  isLoading: boolean;
  error: any;
  response: any;
}

const ErrorHandlingDemo = () => {
  const [errorType, setErrorType] = useState<string>('none');
  const [delay, setDelay] = useState<number>(0);
  const [state, setState] = useState<ErrorDemoState>({
    isLoading: false,
    error: null,
    response: null
  });

  const testEndpoint = async () => {
    setState({ isLoading: true, error: null, response: null });
    
    try {
      const response = await fetch('https://project-ref.supabase.co/functions/v1/demo-error-handling', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ errorType, simulateDelay: delay }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setState({
          isLoading: false,
          error: {
            message: data.error,
            statusCode: data.status,
            code: data.code,
            details: data.details,
            requestId: data.requestId,
            timestamp: data.timestamp
          },
          response: null
        });
      } else {
        setState({
          isLoading: false,
          error: null,
          response: data
        });
      }
    } catch (error) {
      setState({
        isLoading: false,
        error: {
          message: 'Network error: Could not connect to the edge function',
          statusCode: 0,
          code: 'NETWORK_ERROR'
        },
        response: null
      });
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Edge Function Error Handling Demo</h1>
        <p className="text-muted-foreground mb-6">
          Test how our error handling system works with edge functions.
          Select different error types to simulate various error conditions.
        </p>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Edge Function</CardTitle>
            <CardDescription>
              Configure the type of response you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="error-type">Error Type</Label>
                <Select
                  value={errorType}
                  onValueChange={setErrorType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select error type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Success)</SelectItem>
                    <SelectItem value="badRequest">Bad Request (400)</SelectItem>
                    <SelectItem value="unauthorized">Unauthorized (401)</SelectItem>
                    <SelectItem value="forbidden">Forbidden (403)</SelectItem>
                    <SelectItem value="notFound">Not Found (404)</SelectItem>
                    <SelectItem value="rateLimited">Rate Limited (429)</SelectItem>
                    <SelectItem value="serverError">Server Error (500)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="delay">Simulate Processing Delay</Label>
                  <span className="text-sm text-muted-foreground">{delay}ms</span>
                </div>
                <Slider
                  id="delay"
                  min={0}
                  max={3000}
                  step={100}
                  value={[delay]}
                  onValueChange={(values) => setDelay(values[0])}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={testEndpoint} disabled={state.isLoading}>
              {state.isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Endpoint'
              )}
            </Button>
          </CardFooter>
        </Card>
        
        {state.error && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2">Error Response</h2>
            <EdgeFunctionError 
              error={state.error} 
              showDetails={true}
            />
          </div>
        )}
        
        {state.response && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2">Success Response</h2>
            <Card>
              <CardContent className="pt-6">
                <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                  {JSON.stringify(state.response, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorHandlingDemo;
