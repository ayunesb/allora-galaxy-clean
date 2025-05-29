import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface ErrorStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onClick?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  actionLabel,
  onClick,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6">
      <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{message}</p>
      {actionLabel && onClick && (
        <Button onClick={onClick} variant="outline" size="sm">
          <RefreshCcw className="h-4 w-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

const ErrorStateExamples: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Error State Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <ErrorState
                  title="Failed to load data"
                  message="There was an error loading the requested data. Please try again."
                  actionLabel="Try again"
                  onClick={() => console.log("Retry loading data")}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <ErrorState
                  title="Network error"
                  message="Unable to connect to the server. Please check your connection."
                  actionLabel="Reconnect"
                  onClick={() => console.log("Reconnect attempt")}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <ErrorState
                  title="API error"
                  message="The requested resource is unavailable. Please try again later."
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <ErrorState
                  title="Permission denied"
                  message="You don't have the required permissions to view this content."
                  actionLabel="Request access"
                  onClick={() => console.log("Request access")}
                />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorStateExamples;
