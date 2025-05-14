
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AsyncDataRenderer from '@/components/ui/async-data-renderer';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { useEdgeFunctionOperation } from '@/hooks/useEdgeFunctionOperation';
import EdgeFunctionHandler from '@/components/errors/EdgeFunctionHandler';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { EmptyStateRenderer } from '@/components/errors/EmptyStateRenderer';
import { useToast } from '@/components/ui/use-toast';

interface DataItem {
  id: string;
  name: string;
  value: number;
}

/**
 * Example component demonstrating different loading and error states
 */
export default function LoadingErrorStatesExample() {
  const { toast } = useToast();
  const [tab, setTab] = useState('async');
  const [delay, setDelay] = useState(1500);
  const [shouldFail, setShouldFail] = useState(false);
  const [emptyData, setEmptyData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock async operation that can succeed, fail or return empty data
  const mockFetch = async (): Promise<DataItem[]> => {
    await new Promise(resolve => setTimeout(resolve, delay));
    
    if (shouldFail) {
      throw new Error('Failed to fetch data. This is a simulated error.');
    }
    
    if (emptyData) {
      return [];
    }
    
    return [
      { id: '1', name: 'Item 1', value: 100 },
      { id: '2', name: 'Item 2', value: 200 },
      { id: '3', name: 'Item 3', value: 300 },
      { id: '4', name: 'Item 4', value: 400 },
      { id: '5', name: 'Item 5', value: 500 }
    ];
  };

  // useAsyncOperation example
  const { 
    execute: fetchData, 
    data, 
    isLoading, 
    isError, 
    error, 
    retry,
    retryCount,
    isRetrying
  } = useAsyncOperation<DataItem[]>({
    showLoadingToast: false,
    showSuccessToast: false,
    showErrorToast: true,
    loadingMessage: 'Fetching data...',
    successMessage: 'Data fetched successfully',
    errorMessage: 'Failed to fetch data'
  });

  // useEdgeFunctionOperation example
  const edgeFunctionOp = useEdgeFunctionOperation<DataItem[]>({
    functionName: 'demo-error-handling',
    showLoadingToast: false,
    showErrorToast: true,
    loadingMessage: 'Processing request...',
    successMessage: 'Edge function executed successfully',
    errorMessage: 'Edge function execution failed'
  });

  const handleFetchClick = () => {
    fetchData(() => mockFetch());
  };

  const handleEdgeFunctionClick = () => {
    edgeFunctionOp.execute({ shouldFail, emptyData, delay });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    toast({
      title: "Search cleared",
      description: "Showing all results"
    });
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Loading & Error States</h1>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Control the behavior of the examples</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delay">Delay (ms)</Label>
              <Input
                id="delay"
                type="number"
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                id="shouldFail"
                type="checkbox"
                checked={shouldFail}
                onChange={() => setShouldFail(!shouldFail)}
                className="w-4 h-4"
              />
              <Label htmlFor="shouldFail">Simulate Error</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                id="emptyData"
                type="checkbox"
                checked={emptyData}
                onChange={() => setEmptyData(!emptyData)}
                className="w-4 h-4"
              />
              <Label htmlFor="emptyData">Return Empty Data</Label>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex space-x-2 w-full">
              <Button onClick={handleFetchClick} className="flex-1">Async Operation</Button>
              <Button onClick={handleEdgeFunctionClick} className="flex-1">Edge Function</Button>
            </div>
          </CardFooter>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Loading Indicators</CardTitle>
            <CardDescription>Different types of loading indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="border rounded-md h-24 flex items-center justify-center relative">
                <LoadingIndicator size="sm" />
              </div>
              <div className="border rounded-md h-24 flex items-center justify-center relative">
                <LoadingIndicator size="md" />
              </div>
              <div className="border rounded-md h-24 flex items-center justify-center relative">
                <LoadingIndicator size="lg" />
              </div>
              <div className="border rounded-md h-24 flex items-center justify-center relative">
                <LoadingIndicator size="sm" text="Loading..." />
              </div>
              <div className="border rounded-md h-24 flex items-center justify-center relative">
                <LoadingIndicator size="md" text="Processing..." />
              </div>
              <div className="border rounded-md h-24 flex items-center justify-center relative">
                <LoadingIndicator size="lg" text="Please wait..." />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="async" value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="async">Async Data Renderer</TabsTrigger>
          <TabsTrigger value="edge">Edge Function Handler</TabsTrigger>
        </TabsList>
        
        <TabsContent value="async" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>AsyncDataRenderer Example</CardTitle>
              <CardDescription>Handles loading, error and empty states consistently</CardDescription>
            </CardHeader>
            <CardContent>
              <AsyncDataRenderer
                data={data}
                isLoading={isLoading}
                isError={isError}
                error={error}
                onRetry={retry}
                retryCount={retryCount}
                maxRetries={3}
                isRetrying={isRetrying}
                loadingText="Loading data..."
                errorMessage="We couldn't load the data. Please try again."
                emptyMessage="No data available. Try changing the filters."
                showDetails={true}
                className="min-h-[300px]"
              >
                {(items) => (
                  <>
                    <div className="mb-4">
                      <Label htmlFor="search">Search</Label>
                      <Input
                        id="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search items..."
                      />
                    </div>
                    
                    {searchTerm && items.filter(item => 
                      item.name.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length === 0 ? (
                      <EmptyStateRenderer
                        type="no-search-results"
                        searchTerm={searchTerm}
                        onClear={handleClearSearch}
                      />
                    ) : (
                      <div className="space-y-2">
                        {items
                          .filter(item => 
                            !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map(item => (
                            <div 
                              key={item.id} 
                              className="p-3 border rounded-md flex justify-between items-center"
                            >
                              <span>{item.name}</span>
                              <span className="font-medium">{item.value}</span>
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </>
                )}
              </AsyncDataRenderer>
            </CardContent>
            <CardFooter>
              <Button onClick={handleFetchClick} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Refresh Data'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="edge" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>EdgeFunctionHandler Example</CardTitle>
              <CardDescription>Handles edge function operations with robust error handling</CardDescription>
            </CardHeader>
            <CardContent>
              <EdgeFunctionHandler
                isLoading={edgeFunctionOp.isLoading}
                error={edgeFunctionOp.error}
                onRetry={edgeFunctionOp.retry}
                showDetails={true}
                loadingText="Processing edge function request..."
                retryCount={edgeFunctionOp.retryCount}
                maxRetries={3}
                isRetrying={edgeFunctionOp.isRetrying}
                className="min-h-[300px]"
              >
                {edgeFunctionOp.data ? (
                  <div className="space-y-2">
                    {edgeFunctionOp.data.length === 0 ? (
                      <EmptyStateRenderer
                        type="no-data"
                        message="No data returned from the edge function"
                        onRefresh={handleEdgeFunctionClick}
                      />
                    ) : (
                      edgeFunctionOp.data.map(item => (
                        <div 
                          key={item.id} 
                          className="p-3 border rounded-md flex justify-between items-center"
                        >
                          <span>{item.name}</span>
                          <span className="font-medium">{item.value}</span>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">Click the button below to execute the edge function</p>
                  </div>
                )}
              </EdgeFunctionHandler>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleEdgeFunctionClick} 
                disabled={edgeFunctionOp.isLoading}
              >
                {edgeFunctionOp.isLoading ? 'Processing...' : 'Execute Edge Function'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
