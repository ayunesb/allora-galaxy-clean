
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import PageHelmet from '@/components/PageHelmet';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <PageHelmet title="Unauthorized" description="You don't have permission to access this page" />
      
      <Card className="max-w-lg w-full shadow-lg border-destructive/30">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-destructive">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Alert className="border-destructive/40 bg-destructive/10">
            <AlertTitle>Insufficient Permissions</AlertTitle>
            <AlertDescription>
              This area requires additional privileges. If you believe this is an error,
              please contact your workspace administrator.
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 text-muted-foreground">
            <p>You might want to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Return to the dashboard</li>
              <li>Contact your workspace admin for access</li>
              <li>Access another available section</li>
            </ul>
          </div>
        </CardContent>
        
        <CardFooter className="flex gap-2 justify-end">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
          <Button 
            variant="default"
            onClick={() => navigate('/')}
          >
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Unauthorized;
