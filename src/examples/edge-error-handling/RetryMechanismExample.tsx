import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AsyncDataRenderer } from "@/components/ui/async-data-renderer";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";

interface ExampleData {
  id: string;
  name: string;
  status: string;
  timestamp: string;
}

const RetryMechanismExample: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<ExampleData[] | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Simulate data fetching with potential errors
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    setIsRetrying(false);

    try {
      // Simulate API call with artificial delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate error on first attempt
      if (retryCount === 0) {
        throw new Error("Failed to fetch data. Please try again.");
      }

      // Success on retry
      const mockData: ExampleData[] = [
        {
          id: "1",
          name: "Example Item 1",
          status: "active",
          timestamp: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Example Item 2",
          status: "pending",
          timestamp: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Example Item 3",
          status: "completed",
          timestamp: new Date().toISOString(),
        },
      ];

      setData(mockData);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred"),
      );
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    setIsRetrying(true);
    fetchData();
  };

  const handleInitialFetch = () => {
    setRetryCount(0);
    fetchData();
  };

  // Render data view component
  const renderDataView = (items: ExampleData[]) => (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex justify-between items-center border-b pb-2"
        >
          <div>
            <h4 className="font-medium">{item.name}</h4>
            <p className="text-sm text-muted-foreground">
              {new Date(item.timestamp).toLocaleString()}
            </p>
          </div>
          <Badge
            variant={
              item.status === "active"
                ? "default"
                : item.status === "pending"
                  ? "outline"
                  : "secondary"
            }
          >
            {item.status}
          </Badge>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Retry Mechanism Example</span>
          {retryCount > 0 && data && (
            <Badge
              variant="outline"
              className="bg-green-100 text-green-800 border-green-300"
            >
              Succeeded after {retryCount}{" "}
              {retryCount === 1 ? "retry" : "retries"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {!isLoading && !data && !error ? (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground mb-4">
              Click the button to fetch data
            </p>
            <Button onClick={handleInitialFetch}>Fetch Data</Button>
          </div>
        ) : (
          <>
            <AsyncDataRenderer
              data={data}
              isLoading={isLoading}
              error={error}
              onRetry={handleRetry}
              loadingText="Fetching data..."
              renderData={renderDataView}
            />

            {!isLoading && !error && data && (
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInitialFetch}
                  className="gap-2"
                >
                  <RefreshCw className="h-3 w-3" />
                  Refresh
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RetryMechanismExample;
