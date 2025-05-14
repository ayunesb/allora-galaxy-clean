
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle, ArrowRight, Check, RefreshCw } from 'lucide-react';
import EdgeFunctionErrorDisplay from '@/components/errors/EdgeFunctionErrorDisplay';
import { EdgeFunctionErrorHandler } from '@/components/errors/withEdgeFunctionErrorHandling';
import { useEdgeFunctionMutation } from '@/hooks/useEdgeFunctionQuery';
import useEdgeFunction from '@/hooks/useEdgeFunction';

/**
 * Mock edge function responses for demonstration purposes
 */
const getMockResponse = (type: string) => {
  // Simulate different error scenarios
  switch (type) {
    case 'success':
      return { 
        success: true, 
        data: { message: 'Operation completed successfully' },
        timestamp: new Date().toISOString(),
        requestId: `req_demo_${Date.now()}`
      };
    case '400':
      return { 
        success: false,
        error: 'Bad Request: Invalid input parameters',
        code: 'BAD_REQUEST',
        status: 400,
        timestamp: new Date().toISOString(),
        requestId: `req_demo_${Date.now()}`
      };
    case '401':
      return { 
        success: false,
        error: 'Unauthorized: Authentication required',
        code: 'UNAUTHORIZED',
        status: 401,
        timestamp: new Date().toISOString(),
        requestId: `req_demo_${Date.now()}`
      };
    case '404':
      return { 
        success: false,
        error: 'Not Found: The requested resource does not exist',
        code: 'NOT_FOUND',
        status: 404, 
        timestamp: new Date().toISOString(),
        requestId: `req_demo_${Date.now()}`
      };
    case '500':
      return { 
        success: false,
        error: 'Internal Server Error: Something went wrong on our end',
        code: 'INTERNAL_ERROR',
        status: 500,
        details: {
          service: 'database',
          operation: 'query',
          sql_error: 'connection refused'
        },
        timestamp: new Date().toISOString(),
        requestId: `req_demo_${Date.now()}`
      };
    default:
      return { 
        success: false,
        error: 'Unknown error occurred',
        code: 'UNKNOWN_ERROR',
        status: 500,
        timestamp: new Date().toISOString(),
        requestId: `req_demo_${Date.now()}`
      };
  }
};

export default function EdgeFunctionErrorHandlingDemo() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('display');
  const [mockResponseType, setMockResponseType] = useState('success');
  const [loading, setLoading] = useState(false);
  const [currentError, setCurrentError] = useState<any>(null);

  // Example using the useEdgeFunction hook
  const { execute, isLoading, error: hookError, data } = useEdgeFunction(
    async () => {
      // This simulates an edge function call
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      const mockResponse = getMockResponse(mockResponseType);
      setLoading(false);
      
      if (!mockResponse.success) {
        throw mockResponse;
      }
      
      return mockResponse.data;
    },
    {
      showToast: true,
      errorMessage: 'Failed to execute edge function',
      retryOnError: true
    }
  );

  // Example using the React Query-based hook
  const mutation = useEdgeFunctionMutation('mock-edge-function', {
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Edge function executed successfully',
        variant: 'default'
      });
    }
  });

  const simulateEdgeFunctionCall = async () => {
    setCurrentError(null);
    
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      const mockResponse = getMockResponse(mockResponseType);
      setLoading(false);
      
      if (!mockResponse.success) {
        setCurrentError(mockResponse);
        return;
      }
      
      toast({
        title: 'Success',
        description: 'Edge function executed successfully',
        variant: 'default'
      });
    } catch (err) {
      setLoading(false);
      setCurrentError(err);
    }
  };

  return (
    <div className="container py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Edge Function Error Handling</h1>
      <p className="text-muted-foreground mb-8">
        Demonstration of standardized error handling for edge function calls
      </p>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Simulate Edge Function Response</CardTitle>
          <CardDescription>
            Select a response type to simulate different edge function outcomes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={mockResponseType === 'success' ? 'default' : 'outline'}
              onClick={() => setMockResponseType('success')}
              size="sm"
            >
              Success
            </Button>
            <Button
              variant={mockResponseType === '400' ? 'default' : 'outline'}
              onClick={() => setMockResponseType('400')}
              size="sm"
            >
              400 Bad Request
            </Button>
            <Button
              variant={mockResponseType === '401' ? 'default' : 'outline'}
              onClick={() => setMockResponseType('401')}
              size="sm"
            >
              401 Unauthorized
            </Button>
            <Button
              variant={mockResponseType === '404' ? 'default' : 'outline'}
              onClick={() => setMockResponseType('404')}
              size="sm"
            >
              404 Not Found
            </Button>
            <Button
              variant={mockResponseType === '500' ? 'default' : 'outline'}
              onClick={() => setMockResponseType('500')}
              size="sm"
            >
              500 Server Error
            </Button>
          </div>
          
          <Button 
            onClick={simulateEdgeFunctionCall} 
            disabled={loading}
            className="mr-2"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ArrowRight className="mr-2 h-4 w-4" />
                Execute Edge Function
              </>
            )}
          </Button>
          
          <Button 
            onClick={() => execute()} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Using Hook...
              </>
            ) : (
              <>
                <ArrowRight className="mr-2 h-4 w-4" />
                Execute With Hook
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="display">Error Display</TabsTrigger>
          <TabsTrigger value="handler">Error Handler</TabsTrigger>
          <TabsTrigger value="hook">Edge Function Hook</TabsTrigger>
        </TabsList>
        
        <TabsContent value="display" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Edge Function Error Display</CardTitle>
              <CardDescription>
                Standardized component for displaying edge function errors
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentError ? (
                <EdgeFunctionErrorDisplay 
                  error={currentError} 
                  onRetry={simulateEdgeFunctionCall}
                  showDetails={true}
                />
              ) : (
                <div className="flex items-center justify-center p-8 text-center border rounded-md border-dashed">
                  <div>
                    {loading ? (
                      <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Check className="mx-auto h-8 w-8 text-green-500" />
                        <p className="mt-2 text-sm text-muted-foreground">No errors to display</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="handler" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Edge Function Error Handler</CardTitle>
              <CardDescription>
                Conditional rendering based on error state
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EdgeFunctionErrorHandler
                isLoading={loading}
                error={currentError}
                onRetry={simulateEdgeFunctionCall}
                showDetails={true}
              >
                <div className="p-6 border rounded-md border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                  <div className="flex items-center">
                    <Check className="h-6 w-6 text-green-500 mr-2" />
                    <h3 className="font-medium text-green-900 dark:text-green-300">Success!</h3>
                  </div>
                  <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                    Edge function executed successfully with no errors.
                  </p>
                </div>
              </EdgeFunctionErrorHandler>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="hook" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Edge Function Hook Usage</CardTitle>
              <CardDescription>
                Using the useEdgeFunction hook for error handling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 border rounded-md">
                <h3 className="font-medium mb-2">Hook State:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Loading:</div>
                  <div>{isLoading ? 'True' : 'False'}</div>
                  
                  <div className="font-medium">Has Error:</div>
                  <div>{hookError ? 'True' : 'False'}</div>
                  
                  <div className="font-medium">Has Data:</div>
                  <div>{data ? 'True' : 'False'}</div>
                </div>
              </div>
              
              <EdgeFunctionErrorHandler
                isLoading={isLoading}
                error={hookError}
                onRetry={() => execute()}
                showDetails={true}
              >
                {data ? (
                  <div className="p-6 border rounded-md border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                    <div className="flex items-center">
                      <Check className="h-6 w-6 text-green-500 mr-2" />
                      <h3 className="font-medium text-green-900 dark:text-green-300">Success!</h3>
                    </div>
                    <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                      Edge function executed successfully with the hook.
                    </p>
                    <pre className="mt-3 p-3 bg-green-100 dark:bg-green-900 rounded text-xs font-mono overflow-auto">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-8 text-center border rounded-md border-dashed">
                    <div>
                      <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
                      <p className="mt-2 text-sm text-muted-foreground">No data available yet. Execute the function to see results.</p>
                    </div>
                  </div>
                )}
              </EdgeFunctionErrorHandler>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
