
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EdgeFunctionHandler } from '@/components/errors/EdgeFunctionHandler';

const EdgeFunctionErrorPatterns = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const triggerError = async (statusCode: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate an edge function call that returns an error
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const errorMessage = {
        400: 'Invalid parameters provided',
        401: 'Unauthorized: Missing or invalid token',
        403: 'Forbidden: You don\'t have permission for this action',
        404: 'Resource not found',
        429: 'Rate limit exceeded. Try again later',
        500: 'Internal server error',
      }[statusCode] || 'Unknown error';
      
      const error = new Error(errorMessage);
      (error as any).status = statusCode;
      (error as any).requestId = 'req_' + Math.random().toString(36).substring(2, 10);
      
      throw error;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // This is a mock of a Supabase functions response to avoid the type error
  const mockSupabaseFunctionsResponse = (data: any, error?: any): Response => {
    const responseInit: ResponseInit = { status: error ? 400 : 200 };
    const responseBody = error ? JSON.stringify({ error }) : JSON.stringify({ data });
    return new Response(responseBody, responseInit);
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Edge Function Error Patterns</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="display">
          <TabsList className="mb-4">
            <TabsTrigger value="display">Edge Error Display</TabsTrigger>
            <TabsTrigger value="handling">Error Handling</TabsTrigger>
          </TabsList>
          
          <TabsContent value="display" className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <Button size="sm" variant="outline" onClick={() => triggerError(400)}>400 Error</Button>
              <Button size="sm" variant="outline" onClick={() => triggerError(401)}>401 Error</Button>
              <Button size="sm" variant="outline" onClick={() => triggerError(403)}>403 Error</Button>
              <Button size="sm" variant="outline" onClick={() => triggerError(404)}>404 Error</Button>
              <Button size="sm" variant="outline" onClick={() => triggerError(500)}>500 Error</Button>
            </div>
            
            <EdgeFunctionHandler 
              isLoading={isLoading} 
              error={error}
              onRetry={() => error && triggerError((error as any).status || 500)}
              showDetails={true}
            >
              <div className="p-4 bg-green-50 text-green-800 rounded-md">
                No errors! The edge function completed successfully.
              </div>
            </EdgeFunctionHandler>
          </TabsContent>
          
          <TabsContent value="handling" className="space-y-4">
            <p className="text-muted-foreground">
              Edge function errors should be handled consistently across the application.
              Use the <code>EdgeFunctionHandler</code> component or the <code>handleEdgeError</code> utility.
            </p>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`// Example of proper error handling
try {
  const result = await supabase.functions.invoke('my-function', { 
    body: params 
  });
  
  // Mock response for type checking
  const mockResponse = ${mockSupabaseFunctionsResponse({ success: true }, null)};
  
  // Handle edge function-specific errors
  if (!result.data?.success) {
    throw new Error(result.error?.message || 'Function failed');
  }
  
  return result.data;
} catch (error) {
  handleEdgeError(error, { 
    showToast: true,
    retryHandler: () => retryFunction() 
  });
  return null;
}`}
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EdgeFunctionErrorPatterns;
