
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DataStateHandler } from "@/components/ui/data-state-handler";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/lib/notifications/toast";
import { useErrorHandler } from "@/lib/errors/useErrorHandler";
import { EmptyStateRenderer } from '@/components/errors';

const LoadingErrorStatesExample: React.FC = () => {
  // Example state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any[] | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  
  const simulateLoading = () => {
    setLoading(true);
    setError(null);
    setData(null);
    
    // Simulate fetch
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };
  
  const simulateSuccess = () => {
    setLoading(true);
    setError(null);
    
    // Simulate fetch
    setTimeout(() => {
      setData([
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
        { id: 3, name: "Item 3" }
      ]);
      setLoading(false);
    }, 1500);
  };
  
  const simulateError = () => {
    setLoading(true);
    setError(null);
    setData(null);
    
    // Simulate fetch
    setTimeout(() => {
      const error = new Error("Failed to load data");
      handleError(error);
      setError(error);
      setLoading(false);
    }, 1500);
  };
  
  const simulateEmptyData = () => {
    setLoading(true);
    setError(null);
    
    // Simulate fetch
    setTimeout(() => {
      setData([]);
      setLoading(false);
    }, 1500);
  };
  
  // Reset everything
  const reset = () => {
    setLoading(false);
    setError(null);
    setData(null);
    setSearchTerm("");
  };
  
  const DataComponent = ({ data }: { data: any[] }) => (
    <div className="grid gap-2">
      {data.map(item => (
        <div key={item.id} className="p-4 border rounded-md">
          {item.name}
        </div>
      ))}
    </div>
  );
  
  const loadingStates = [
    { name: "Loading", action: simulateLoading },
    { name: "Success", action: simulateSuccess },
    { name: "Error", action: simulateError },
    { name: "Empty", action: simulateEmptyData }
  ];

  return (
    <div className="container py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Data State Handler Example</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {loadingStates.map((state) => (
              <Button 
                key={state.name} 
                onClick={state.action} 
                variant="outline"
                disabled={loading}
              >
                {state.name}
              </Button>
            ))}
            <Button 
              onClick={reset} 
              variant="ghost"
            >
              Reset
            </Button>
          </div>
          
          <div className="p-4 border rounded-md">
            <DataStateHandler
              data={data}
              loading={loading}
              error={error}
              onRetry={simulateSuccess}
              emptyState={
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No data available</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={simulateSuccess} 
                    className="mt-2"
                  >
                    Add Data
                  </Button>
                </div>
              }
              loadingMessage="Loading your data..."
            >
              {(data) => <DataComponent data={data} />}
            </DataStateHandler>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="empty">
        <TabsList>
          <TabsTrigger value="empty">Empty States</TabsTrigger>
          <TabsTrigger value="search">Search & Filter</TabsTrigger>
        </TabsList>
        
        <TabsContent value="empty" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Empty State Variants</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">No Data</h3>
                <EmptyStateRenderer
                  stateType="no-data"
                  customMessage="There is no data to display right now."
                  action={() => toast({ title: "Action triggered" })}
                  actionText="Refresh Data"
                />
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Card Empty</h3>
                <EmptyStateRenderer
                  stateType="card"
                  title="No Items"
                  customMessage="No items have been added to your collection yet."
                  action={() => toast({ title: "Action triggered" })}
                  actionText="Add Item"
                />
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">List Empty</h3>
                <EmptyStateRenderer
                  stateType="list"
                  title="Empty List"
                  customMessage="Your list is currently empty."
                  action={() => toast({ title: "Action triggered" })}
                  actionText="Create New"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Type to search..."
                />
              </div>
              
              {searchTerm && (
                <div className="border rounded-lg p-4">
                  <EmptyStateRenderer
                    stateType="no-search-results"
                    searchTerm={searchTerm}
                    onClear={() => setSearchTerm("")}
                  />
                </div>
              )}
              
              <div className="mt-4 border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Filter Empty</h3>
                <EmptyStateRenderer
                  stateType="filter"
                  customMessage="No results match your current filters."
                  onClear={() => toast({ title: "Filters cleared" })}
                  filterCount={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoadingErrorStatesExample;
