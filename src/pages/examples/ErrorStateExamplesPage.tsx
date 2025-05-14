
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ErrorStateExamples from '@/components/examples/ErrorStateExamples';
import EdgeErrorHandlingExamples from '@/examples/edge-error-handling';
import LoadingErrorStatesExample from '@/components/examples/LoadingErrorStatesExample';
import { PageErrorBoundary, ErrorBoundary } from '@/lib/errors';

const ErrorStateExamplesPage: React.FC = () => {
  return (
    <PageErrorBoundary>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-6 container">Error & Loading State Examples</h1>
        
        <Tabs defaultValue="loading-errors" className="container">
          <TabsList>
            <TabsTrigger value="loading-errors">Consistent Loading & Errors</TabsTrigger>
            <TabsTrigger value="error-states">Error Components</TabsTrigger>
            <TabsTrigger value="edge-errors">Edge Function Errors</TabsTrigger>
          </TabsList>
          
          <TabsContent value="loading-errors" className="mt-4">
            <ErrorBoundary>
              <LoadingErrorStatesExample />
            </ErrorBoundary>
          </TabsContent>
          
          <TabsContent value="error-states" className="mt-4">
            <ErrorBoundary>
              <ErrorStateExamples />
            </ErrorBoundary>
          </TabsContent>
          
          <TabsContent value="edge-errors" className="mt-4">
            <ErrorBoundary>
              <EdgeErrorHandlingExamples />
            </ErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>
    </PageErrorBoundary>
  );
};

export default ErrorStateExamplesPage;
