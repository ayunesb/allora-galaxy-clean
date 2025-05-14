
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Home, ArrowLeft, LogIn, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    // Show toast when component mounts
    toast({
      title: "Access Denied",
      description: "You don't have permission to access this resource",
      variant: "destructive",
    });
  }, []);
  
  return (
    <div className="container mx-auto px-4 flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-red-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mb-4">
            {user ? (
              <ShieldAlert className="h-12 w-12 text-red-600" />
            ) : (
              <AlertTriangle className="h-12 w-12 text-amber-600" />
            )}
          </div>
          <CardTitle className="text-3xl">
            {user ? "Access Denied" : "Authentication Required"}
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            {user 
              ? "You don't have permission to access this resource"
              : "You must be signed in to access this resource"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-muted-foreground">
            {user ? (
              <p>
                This page requires higher privileges than your current role provides.
                Please contact your workspace administrator if you believe you should have access.
              </p>
            ) : (
              <p>
                Please sign in to continue. If you don't have an account,
                you can register for one to access this resource.
              </p>
            )}
          </div>
          
          {/* Visual representation of the security barrier */}
          <div className="flex items-center justify-center py-4">
            <div className="w-1/3 h-2 bg-red-200"></div>
            <div className="w-12 h-12 rounded-full border-4 border-red-500 flex items-center justify-center text-red-500">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="w-1/3 h-2 bg-red-200"></div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          {user ? (
            <>
              <Button 
                variant="default" 
                className="w-full" 
                onClick={() => navigate('/')}
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
            </>
          ) : (
            <>
              <Button 
                variant="default" 
                className="w-full" 
                onClick={() => navigate('/auth/login', { state: { from: window.location.pathname } })}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate('/auth/register')}
              >
                Register
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Unauthorized;
