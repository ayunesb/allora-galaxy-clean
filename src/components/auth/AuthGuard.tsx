
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from '@/components/LoadingScreen';
import { toast } from '@/components/ui/use-toast';
import { UserRole } from '@/types/shared';

interface AuthGuardProps {
  children: React.ReactNode;
  roles?: UserRole[];
  redirectTo?: string;
}

/**
 * AuthGuard component that restricts access based on authentication and user roles
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  roles = [],
  redirectTo = '/auth/login'
}) => {
  const { user, userRole, isLoading, checkUserRole } = useAuth();
  const location = useLocation();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  
  useEffect(() => {
    const verifyAccess = async () => {
      if (!user) {
        setHasAccess(false);
        return;
      }
      
      // If no roles specified, just check if the user is authenticated
      if (roles.length === 0) {
        setHasAccess(true);
        return;
      }
      
      // Check if the user has any of the required roles
      const result = await checkUserRole(roles as string[]);
      setHasAccess(result);
      
      if (!result) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this resource",
          variant: "destructive",
        });
      }
    };
    
    if (!isLoading) {
      verifyAccess();
    }
  }, [user, userRole, isLoading, roles, checkUserRole]);
  
  if (isLoading || hasAccess === null) {
    return <LoadingScreen />;
  }
  
  if (!hasAccess) {
    // Save the attempted location for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

export default AuthGuard;
