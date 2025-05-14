import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ErrorState } from "@/lib/errors";
import RetryMechanismExample from "@/examples/edge-error-handling/RetryMechanismExample";
import CustomErrorBoundaryExample from "@/examples/edge-error-handling/CustomErrorBoundaryExample";
import EdgeFunctionErrorPatterns from "@/examples/edge-error-handling/EdgeFunctionErrorPatterns";
import { EmptyState, NoDataEmptyState, FilterEmptyState, NoSearchResultsEmptyState } from '@/components/errors/EmptyStates';

const ErrorStateExamples: React.FC = () => {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Error & Empty State Examples</h1>

      <Tabs defaultValue="error-states" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="error-states">Error States</TabsTrigger>
          <TabsTrigger value="empty-states">Empty States</TabsTrigger>
          <TabsTrigger value="edge-errors">Edge Function Errors</TabsTrigger>
        </TabsList>
        <TabsContent value="error-states">
          <Card>
            <CardHeader>
              <CardTitle>Generic Error State</CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorState
                title="Something went wrong"
                description="There was an issue processing your request."
              />
            </CardContent>
            <CardFooter>
              <Button>Try Again</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Error State</CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorState
                title="Unauthorized Access"
                description="You do not have permission to view this content."
                icon="lock"
              />
            </CardContent>
            <CardFooter>
              <Button variant="secondary">Contact Support</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alert Error State</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertTitle>Error!</AlertTitle>
                <AlertDescription>
                  There was a problem with your submission.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="empty-states">
          <Card>
            <CardHeader>
              <CardTitle>No Data</CardTitle>
            </CardHeader>
            <CardContent>
              <NoDataEmptyState />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>No Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <NoSearchResultsEmptyState searchTerm="example" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Filter Empty State</CardTitle>
            </CardHeader>
            <CardContent>
              <FilterEmptyState filters={['Category', 'Date']} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edge-errors">
          <Card>
            <CardHeader>
              <CardTitle>Retry Mechanism</CardTitle>
            </CardHeader>
            <CardContent>
              <RetryMechanismExample />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Error Boundary</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomErrorBoundaryExample />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Edge Function Error Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <EdgeFunctionErrorPatterns />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ErrorStateExamples;
