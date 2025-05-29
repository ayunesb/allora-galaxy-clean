import React, { useState } from "react";
import { ErrorBoundary } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";

// Component that will throw an error for demonstration
const BuggyComponent = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error("This is a simulated error in the BuggyComponent");
  }
  return (
    <div className="p-4 bg-muted rounded">
      This component works correctly when no errors occur.
    </div>
  );
};

// Custom fallback component for our error boundary
const CustomErrorFallback = ({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) => (
  <ErrorState
    title="Something went wrong"
    message={error?.message || "An unknown error occurred"}
    retry={resetErrorBoundary}
    showDetails
    error={error}
    size="md"
    className="my-4"
    action={
      <div className="flex gap-2">
        <Button variant="outline" onClick={resetErrorBoundary}>
          Reset Component
        </Button>
        <Button
          variant="default"
          onClick={() => {
            console.log("Reporting error:", error);
            alert("Error reported to developers");
          }}
        >
          Report Issue
        </Button>
      </div>
    }
  />
);

const CustomErrorBoundaryExample: React.FC = () => {
  const [throwError, setThrowError] = useState(false);

  const handleReset = () => {
    console.log("Error boundary reset triggered");
    setThrowError(false);
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Custom Error Boundary Example</CardTitle>
      </CardHeader>

      <CardContent>
        <ErrorBoundary
          fallback={
            <CustomErrorFallback
              error={new Error("Fallback error")}
              resetErrorBoundary={() => handleReset()}
            />
          }
          onReset={handleReset}
        >
          <BuggyComponent shouldThrow={throwError} />
        </ErrorBoundary>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setThrowError(false)}
          disabled={!throwError}
        >
          Reset
        </Button>

        <Button
          variant={throwError ? "outline" : "destructive"}
          onClick={() => setThrowError(!throwError)}
        >
          {throwError ? "Restore Component" : "Throw Error"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CustomErrorBoundaryExample;
