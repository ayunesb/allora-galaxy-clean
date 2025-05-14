
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/errors';

const BuggyComponent: React.FC = () => {
  const [shouldError, setShouldError] = React.useState(false);
  
  if (shouldError) {
    throw new Error("This is a simulated error!");
  }
  
  return (
    <div className="p-4 border rounded">
      <p className="mb-4">This component will throw an error when you click the button below.</p>
      <Button 
        variant="destructive"
        onClick={() => setShouldError(true)}
      >
        Throw Error
      </Button>
    </div>
  );
};

const CustomErrorBoundaryExample: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Error Boundary Example</CardTitle>
      </CardHeader>
      <CardContent>
        <ErrorBoundary>
          <BuggyComponent />
        </ErrorBoundary>
      </CardContent>
    </Card>
  );
};

export default CustomErrorBoundaryExample;
