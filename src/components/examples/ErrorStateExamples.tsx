
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ErrorState from '@/components/ui/error-state';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

// Simple component implementations for empty state variations
const NoDataEmptyState = ({ title, message, actionLabel, onClick }) => (
  <div className="text-center p-4">
    <h3 className="font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground mb-4">{message}</p>
    {actionLabel && onClick && (
      <Button variant="outline" onClick={onClick}>{actionLabel}</Button>
    )}
  </div>
);

const FilterEmptyState = ({ title, message, onReset }) => (
  <div className="text-center p-4">
    <h3 className="font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground mb-4">{message}</p>
    <Button variant="outline" onClick={onReset}>Reset Filters</Button>
  </div>
);

const CardEmptyState = ({ title, message, action }) => (
  <div className="text-center p-4">
    <h3 className="font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground mb-4">{message}</p>
    {action && (
      <Button variant="link" onClick={action.onClick}>{action.label}</Button>
    )}
  </div>
);

const ErrorStateExamples: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Error & Empty States Examples</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Basic Error State */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Error State</CardTitle>
            <CardDescription>Simple error with title and message</CardDescription>
          </CardHeader>
          <CardContent>
            <ErrorState 
              title="Something went wrong" 
              message="There was an error loading your data"
            />
          </CardContent>
        </Card>
        
        {/* Error with Icon and Retry */}
        <Card>
          <CardHeader>
            <CardTitle>Error with Custom Message</CardTitle>
            <CardDescription>Custom icon and retry option</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-2">
              <AlertTriangle className="h-10 w-10 text-red-500" />
              <ErrorState 
                title="Connection Error" 
                message="Failed to connect to the server"
                retry={() => alert('Retrying...')}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Error with Details */}
        <Card>
          <CardHeader>
            <CardTitle>Error with Details</CardTitle>
            <CardDescription>Technical error information</CardDescription>
          </CardHeader>
          <CardContent>
            <ErrorState 
              title="API Error" 
              message="Could not fetch data from API"
              error={new Error("500 Internal Server Error: The server encountered an unexpected condition")}
              showDetails={true}
              retry={() => alert('Retrying API call...')}
            />
          </CardContent>
        </Card>
        
        {/* Empty State */}
        <Card>
          <CardHeader>
            <CardTitle>Empty State</CardTitle>
            <CardDescription>When there's no data to display</CardDescription>
          </CardHeader>
          <CardContent>
            <NoDataEmptyState 
              title="No Items Found"
              message="No items found in your collection"
              actionLabel="Add Item"
              onClick={() => alert('Adding new item...')}
            />
          </CardContent>
        </Card>
        
        {/* Filter Empty State */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Empty State</CardTitle>
            <CardDescription>No results match the filters</CardDescription>
          </CardHeader>
          <CardContent>
            <FilterEmptyState 
              title="No Results"
              message="Your current filters returned no results"
              onReset={() => alert('Resetting filters...')}
            />
          </CardContent>
        </Card>
        
        {/* Compact Card Empty State */}
        <Card>
          <CardHeader>
            <CardTitle>Card Empty State</CardTitle>
            <CardDescription>Compact empty state for cards</CardDescription>
          </CardHeader>
          <CardContent>
            <CardEmptyState 
              title="No Activity"
              message="There's no recent activity to display"
              action={{ 
                label: "View All", 
                onClick: () => alert('View all...') 
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ErrorStateExamples;
