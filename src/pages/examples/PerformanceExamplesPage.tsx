
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { startMeasurement, endMeasurement, measureAsync } from '@/lib/telemetry/performanceMonitor';
import { PageErrorBoundary } from '@/lib/errors';
import AsyncDataRenderer from '@/components/ui/async-data-renderer';

const PerformanceExamplesPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null);
  const [renderTime, setRenderTime] = useState<number | null>(null);
  const [interactionTime, setInteractionTime] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Simulate slow data fetching
  const fetchData = useCallback(async (delay: number = 2000) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Measure the data fetch performance
      const result = await measureAsync(
        'example-data-fetch',
        'data-fetch',
        async () => {
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Occasionally simulate errors for retry testing
          if (Math.random() < 0.3) {
            throw new Error('Random simulated fetch error');
          }
          
          return {
            items: Array.from({ length: 10 }, (_, i) => ({
              id: i,
              name: `Item ${i}`,
              value: Math.floor(Math.random() * 100)
            })),
            timestamp: new Date().toISOString()
          };
        },
        { pageComponent: 'PerformanceExamplesPage' }
      );
      
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data load with performance measurement
  useEffect(() => {
    const measureId = startMeasurement('component-render', 'PerformanceExamplesPage:initial');
    
    fetchData().finally(() => {
      const duration = endMeasurement(measureId);
      if (duration) setRenderTime(duration);
    });
  }, [fetchData]);

  // Memoize a complex computation
  const processedData = useMemo(() => {
    if (!data?.items) return null;
    
    const startTime = performance.now();
    
    // Simulate expensive computation
    const result = data.items.map(item => {
      let value = item.value;
      for (let i = 0; i < 10000; i++) {
        value = Math.sqrt(value * i) / 2;
      }
      
      return {
        ...item,
        processed: value,
        category: value < 30 ? 'low' : value < 70 ? 'medium' : 'high'
      };
    });
    
    console.log(`Data processing took ${performance.now() - startTime}ms`);
    return result;
  }, [data]);

  // Handle user interaction with performance measurement
  const handleInteraction = useCallback(() => {
    const measureId = startMeasurement('ui-interaction', 'button-click');
    
    // Simulate processing
    setTimeout(() => {
      const duration = endMeasurement(measureId, { buttonType: 'primary' });
      if (duration) setInteractionTime(duration);
    }, 500);
  }, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    setRetryCount(count => count + 1);
    fetchData(1000);
  }, [fetchData]);

  return (
    <PageErrorBoundary>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Performance Optimization Examples</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Performance Monitoring</CardTitle>
              <CardDescription>
                Demonstration of performance metrics tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Initial render time:</span>
                  <span className="font-mono">{renderTime ? `${renderTime.toFixed(2)}ms` : 'Measuring...'}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Last interaction time:</span>
                  <span className="font-mono">{interactionTime ? `${interactionTime.toFixed(2)}ms` : 'N/A'}</span>
                </div>
                
                <Button onClick={handleInteraction} className="w-full">
                  Trigger Interaction
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Async Data Handling</CardTitle>
              <CardDescription>
                Optimized loading, error states and retries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AsyncDataRenderer
                data={data}
                isLoading={isLoading}
                error={error}
                onRetry={handleRetry}
                retryCount={retryCount}
                maxRetries={3}
                loadingText="Optimized loading..."
                showDetails={true}
              >
                {(data) => (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Loaded {data.items.length} items at {new Date(data.timestamp).toLocaleTimeString()}
                    </p>
                    <Button 
                      size="sm"
                      variant="outline" 
                      onClick={() => fetchData()}
                      className="w-full"
                    >
                      Refresh Data
                    </Button>
                  </div>
                )}
              </AsyncDataRenderer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Memoization & Code Splitting</CardTitle>
              <CardDescription>
                Optimizing expensive computations and lazy loading
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data && processedData ? (
                <div className="space-y-2">
                  <p className="text-sm">
                    Processed {processedData.length} items with memoization:
                  </p>
                  <div className="max-h-[150px] overflow-y-auto text-xs">
                    {processedData.map(item => (
                      <div key={item.id} className="flex justify-between py-1 border-b last:border-0">
                        <span>Item {item.id}</span>
                        <span className={
                          item.category === 'low' ? 'text-green-500' : 
                          item.category === 'medium' ? 'text-amber-500' : 
                          'text-red-500'
                        }>
                          {item.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[150px] flex items-center justify-center">
                  <LoadingIndicator size="sm" text="Processing data..." />
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Error Recovery Features</CardTitle>
              <CardDescription>
                Demonstrating graceful error handling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setError(new Error('Manually triggered error for testing'));
                    setData(null);
                  }}
                  className="w-full"
                >
                  Trigger Error
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const err = new Error("Network Error");
                    Object.defineProperty(err, 'status', { value: 503 });
                    Object.defineProperty(err, 'code', { value: 'NETWORK_ERROR' });
                    setError(err);
                    setData(null);
                  }}
                  className="w-full"
                >
                  Trigger Network Error
                </Button>
                
                <Button 
                  variant="default"
                  onClick={() => fetchData(1000)}
                  className="w-full"
                >
                  Reset & Fetch
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageErrorBoundary>
  );
};

export default PerformanceExamplesPage;
