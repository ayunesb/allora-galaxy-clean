
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation, Link } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { Loader2 } from 'lucide-react';

const AuthPage: React.FC = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  // Determine which tab to show based on the current path
  let defaultTab = 'login';
  if (location.pathname.includes('register')) {
    defaultTab = 'register';
  } else if (location.pathname.includes('reset-password')) {
    defaultTab = 'reset-password';
  } else if (location.pathname.includes('forgot-password')) {
    defaultTab = 'forgot-password';
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <div className="w-full max-w-md p-4">
        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Allora OS</CardTitle>
            <CardDescription>
              Galaxy Command Center
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {defaultTab === 'login' && (
              <LoginForm setIsLoading={setIsLoading} />
            )}
            
            {defaultTab === 'register' && (
              <RegisterForm setIsLoading={setIsLoading} />
            )}
            
            {defaultTab === 'reset-password' && (
              <ResetPasswordForm setIsLoading={setIsLoading} />
            )}
            
            {defaultTab === 'forgot-password' && (
              <ForgotPasswordForm setIsLoading={setIsLoading} />
            )}
          </CardContent>
          
          <CardFooter className="flex flex-wrap justify-between gap-2">
            {defaultTab === 'login' && (
              <>
                <Link to="/auth/forgot-password" className="text-sm text-muted-foreground hover:underline">
                  Forgot password?
                </Link>
                <Link to="/auth/register" className="text-sm text-primary hover:underline">
                  Create an account
                </Link>
              </>
            )}
            
            {defaultTab === 'register' && (
              <Link to="/auth/login" className="text-sm text-primary hover:underline">
                Already have an account? Sign in
              </Link>
            )}
            
            {(defaultTab === 'reset-password' || defaultTab === 'forgot-password') && (
              <Link to="/auth/login" className="text-sm text-primary hover:underline">
                Back to login
              </Link>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
