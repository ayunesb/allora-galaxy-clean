import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ChevronLeft, AlertTriangle, RefreshCw } from "lucide-react";

interface PluginDetailErrorProps {
  error: string | null;
}

export const PluginDetailError: React.FC<PluginDetailErrorProps> = ({
  error,
}) => {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);
  const retry = () => window.location.reload();

  return (
    <div className="container mx-auto py-8 animate-fade-in">
      <Button variant="ghost" onClick={goBack} className="mb-4 group">
        <ChevronLeft className="mr-2 h-4 w-4 group-hover:translate-x-[-2px] transition-transform" />{" "}
        Back
      </Button>

      <Card className="max-w-2xl mx-auto border-destructive/20 overflow-hidden">
        <CardHeader className="bg-destructive/10 border-b border-destructive/20">
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="h-5 w-5 mr-2" /> Error
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
          </div>
          <p className="text-center text-lg font-medium mb-2">
            Failed to load plugin details
          </p>
          <p className="text-center text-muted-foreground mb-4">
            {error || "Plugin not found or could not be loaded"}
          </p>
          {error && (
            <div className="bg-muted p-3 rounded-md text-xs font-mono overflow-auto max-h-32 mb-4">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-4 pt-2 pb-6">
          <Button variant="outline" onClick={goBack}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Go Back
          </Button>
          <Button onClick={retry}>
            <RefreshCw className="mr-1 h-4 w-4" /> Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PluginDetailError;
