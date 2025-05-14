
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEdgeFunction } from '@/hooks/useEdgeFunction';
import { useToast } from '@/components/ui/use-toast';
import { EdgeFunctionError } from '@/components/errors/EdgeFunctionErrorHandler';
import { supabase } from '@/integrations/supabase/client';

export default function EdgeErrorHandlingExamples() {
  const { toast } = useToast();
  const [tenantId, setTenantId] = useState<string>('');
  const [value, setValue] = useState<string>('');
  
  // Example using our useEdgeFunction hook
  const { 
    execute, 
    data, 
    error, 
    isLoading, 
    retry 
  } = useEdgeFunction(async (params) => {
    return await supabase.functions.invoke('example-with-validation', { 
      body: params 
    });
  }, {
    showToast: true,
    toastSuccessMessage: 'Request processed successfully!',
    errorMessage: 'Failed to process request',
    retryOnError: true
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await execute({
      tenantId,
      someValue: value
    });
  };

  // Examples of direct error handling approaches
  const triggerValidationError = async () => {
    try {
      const response = await supabase.functions.invoke('example-with-validation', { 
        body: { 
          // Missing required field tenantId
          someValue: 'test'
        }
      });
      
      if (response.error) {
        throw response.error;
      }
      
      toast({
        title: 'Success',
        description: 'Request processed successfully'
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: err.message || 'Invalid request data'
      });
    }
  };
  
  const triggerNotFoundError = async () => {
    try {
      const response = await supabase.functions.invoke('example-with-validation', { 
        body: { 
          tenantId: 'non-existent-tenant-id',
          someValue: 'test'
        }
      });
      
      if (response.error) {
        throw response.error;
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Not Found Error',
        description: err.message || 'Resource not found'
      });
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Edge Function Error Handling Examples</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Example with useEdgeFunction</CardTitle>
            <CardDescription>
              Using our standardized hook for edge function calls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tenantId">Tenant ID</Label>
                <Input 
                  id="tenantId"
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  placeholder="Enter tenant ID"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Input 
                  id="value"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Enter a value"
                />
              </div>
              
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Submit'}
              </Button>
            </form>
            
            {error && (
              <div className="mt-4">
                <EdgeFunctionError 
                  error={error} 
                  retry={retry} 
                  showDetails={true}
                />
              </div>
            )}
            
            {data && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Different Error Types</CardTitle>
            <CardDescription>
              Trigger various edge function error scenarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Button 
                variant="outline" 
                onClick={triggerValidationError}
                className="w-full mb-2"
              >
                Trigger Validation Error
              </Button>
              <p className="text-xs text-muted-foreground">
                Sends an invalid request missing required fields
              </p>
            </div>
            
            <div>
              <Button 
                variant="outline" 
                onClick={triggerNotFoundError}
                className="w-full mb-2"
              >
                Trigger Not Found Error
              </Button>
              <p className="text-xs text-muted-foreground">
                Sends a request with a non-existent tenant ID
              </p>
            </div>
            
            <div>
              <Button 
                variant="outline" 
                onClick={() => {
                  supabase.functions.invoke('non-existent-function', {})
                    .then(() => {})
                    .catch(err => {
                      toast({
                        variant: 'destructive',
                        title: 'Function Not Found',
                        description: err.message || 'Function does not exist'
                      });
                    });
                }}
                className="w-full mb-2"
              >
                Trigger Function Not Found
              </Button>
              <p className="text-xs text-muted-foreground">
                Attempts to call a function that doesn't exist
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
