
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ErrorState from '@/components/ui/error-state';
import { EmptyState, NoDataEmptyState, FilterEmptyState, CardEmptyState } from '@/components/errors/EmptyStates';
import { AlertTriangle, FileSearch, RefreshCw } from 'lucide-react';

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
        
        {/* Error with Icon */}
        <Card>
          <CardHeader>
            <CardTitle>Error with Icon</CardTitle>
            <CardDescription>Custom icon and retry option</CardDescription>
          </CardHeader>
          <CardContent>
            <ErrorState 
              title="Connection Error" 
              message="Failed to connect to the server"
              icon={<AlertTriangle className="h-10 w-10 text-red-500" />}
              retry={() => alert('Retrying...')}
            />
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
              message="No items found in your collection"
              action={() => alert('Adding new item...')}
              actionText="Add Item"
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
              message="Your current filters returned no results"
              resetFilters={() => alert('Resetting filters...')}
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
              action={() => alert('View all...')}
              actionText="View All"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ErrorStateExamples;
