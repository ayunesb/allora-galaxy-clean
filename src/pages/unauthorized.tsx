import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <ShieldAlert className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this resource
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            This page requires higher privileges than your current role
            provides. Please contact your workspace administrator if you believe
            you should have access.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            variant="default"
            className="w-full"
            onClick={() => navigate("/")}
          >
            <Home className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Unauthorized;
