
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EdgeFunctionError } from "@/components/errors/EdgeFunctionErrorHandler";
import { handleEdgeError, processEdgeResponse } from "@/lib/errors/clientErrorHandler";
import { useMutation } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Demo component for testing edge function error handling
 */
export default function ErrorHandlingDemo() {
  const [errorType, setErrorType] = useState("not_found");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  
  // Function to trigger an error via edge function
  const triggerError = async (errorType: string) => {
    const response = await fetch('/api/demo-error-handling', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ errorType }),
    });

    const responseData = await processEdgeResponse(response);
    return responseData;
  };
  
  // Setup the mutation
  const errorMutation = useMutation({
    mutationFn: (selectedErrorType: string) => triggerError(selectedErrorType),
    onSuccess: (data) => {
      setResult({
        success: true,
        message: data.message,
        timestamp: new Date().toISOString(),
      });
      setRequestId(data.requestId || null);
    },
    onError: (error: any) => {
      setResult({
        success: false,
        error,
        timestamp: new Date().toISOString(),
      });
      setRequestId(error.requestId || null);
    }
  });
  
  const handleSubmit = async () => {
    errorMutation.mutate(errorType);
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Edge Function Error Handling Demo</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Trigger Error</CardTitle>
            <CardDescription>
              Test different error scenarios to see how they're handled
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Error Type</Label>
              <Select value={errorType} onValueChange={setErrorType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select error type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_found">Not Found (404)</SelectItem>
                  <SelectItem value="unauthorized">Unauthorized (401)</SelectItem>
                  <SelectItem value="forbidden">Forbidden (403)</SelectItem>
                  <SelectItem value="validation">Validation Error (400)</SelectItem>
                  <SelectItem value="server_error">Server Error (500)</SelectItem>
                  <SelectItem value="timeout">Timeout</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                id="show-details"
                type="checkbox"
                className="form-checkbox"
                checked={showErrorDetails}
                onChange={() => setShowErrorDetails(!showErrorDetails)}
              />
              <Label htmlFor="show-details">Show detailed error information</Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSubmit} 
              disabled={errorMutation.isPending}
              className="w-full"
            >
              {errorMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Trigger Error'
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response</CardTitle>
              <CardDescription>
                {requestId && <span>Request ID: {requestId}</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {errorMutation.isPending ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : errorMutation.isError ? (
                <EdgeFunctionError 
                  error={errorMutation.error as any}
                  showDetails={showErrorDetails}
                  retry={() => errorMutation.mutate(errorType)}
                />
              ) : result?.success ? (
                <Alert>
                  <AlertTitle>Success!</AlertTitle>
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              ) : null}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert">
              <p>
                This demo showcases the error handling system for edge functions:
              </p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Standardized error responses from edge functions</li>
                <li>Client-side error handling with proper components</li>
                <li>Error tracking with request IDs</li>
                <li>Automatic retry capabilities</li>
                <li>Consistent user-friendly error displays</li>
              </ol>
              <p className="text-sm text-muted-foreground mt-4">
                Try different error types to see how the system handles each scenario.
                Toggle "Show detailed error information" to see technical details.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
