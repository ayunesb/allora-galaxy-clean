
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/lib/errors';

const BuggyComponent = () => {
  // This will always throw when rendered
  throw new Error('This is a simulated error');
};

const CustomErrorBoundaryExample = () => {
  const [showError, setShowError] = useState(false);

  const handleReset = () => {
    setShowError(false);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Custom Error Boundary Example</CardTitle>
      </CardHeader>
      <CardContent>
        <ErrorBoundary onReset={handleReset}>
          {showError ? (
            <BuggyComponent />
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Click the button below to render a component that will throw an error.
                The error will be caught by our custom ErrorBoundary.
              </p>
              <Button onClick={() => setShowError(true)}>
                Trigger Error
              </Button>
            </div>
          )}
        </ErrorBoundary>
      </CardContent>
    </Card>
  );
};

export default CustomErrorBoundaryExample;
