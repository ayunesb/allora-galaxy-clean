import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import ErrorState from '@/components/ui/error-state';
import CardErrorState from '@/components/errors/CardErrorState';
import { EmptyState, NoDataEmptyState, FilterEmptyState } from '@/components/errors/EmptyStates';
import PartialErrorState from '@/components/errors/PartialErrorState';
import EdgeFunctionErrorPatterns from '@/examples/edge-error-handling/EdgeFunctionErrorPatterns';
import RetryMechanismExample from '@/examples/edge-error-handling/RetryMechanismExample';
import CustomErrorBoundaryExample from '@/examples/edge-error-handling/CustomErrorBoundaryExample';

// Examples of various error states in the application
const ErrorStateExamples: React.FC = () => {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Basic Error States</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Standard Error State */}
          <ErrorState 
            title="Standard Error"
            message="A standard error with retry functionality."
            retry={() => alert('Retry clicked')}
          />
          
          {/* Error with Details */}
          <ErrorState 
            title="Error with Details"
            message="An error that includes technical details."
            error={new Error("This is the technical error message that would normally be hidden.")}
            showDetails={true}
            retry={() => alert('Retry clicked')}
          />
          
          {/* Card-style error */}
          <CardErrorState
            title="Card Error State"
            message="A card-styled error with action buttons"
            onRetry={() => alert('Retry clicked')}
            onAction={() => alert('Custom action clicked')}
            actionLabel="Custom Action"
          />
          
          {/* Partial Error State */}
          <PartialErrorState
            message="Some data couldn't be loaded, but you can still view available information."
            onRetry={() => alert('Retry clicked')}
            variant="banner"
          />
        </div>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Empty States</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Empty State */}
          <EmptyState
            title="No Items"
            description="No items have been added yet."
            action={() => alert('Add item clicked')}
            actionText="Add Item"
          />
          
          {/* No Data Empty State */}
          <NoDataEmptyState
            onRefresh={() => alert('Refresh clicked')}
            customMessage="No data is currently available for display."
          />
          
          {/* Filter Empty State */}
          <FilterEmptyState
            onClear={() => alert('Reset filters clicked')}
          />
        </div>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Advanced Error Handling</h2>
        <div className="space-y-4">
          {/* Retry Mechanism Example */}
          <RetryMechanismExample />
          
          {/* Custom Error Boundary Example */}
          <CustomErrorBoundaryExample />
          
          {/* Edge Function Error Patterns */}
          <EdgeFunctionErrorPatterns />
        </div>
      </section>
    </div>
  );
};

export default ErrorStateExamples;
