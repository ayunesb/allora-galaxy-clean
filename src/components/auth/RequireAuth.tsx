
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from '@/components/LoadingScreen';
import { toast } from '@/components/ui/use-toast';
import { UserRole } from '@/types/shared';

interface RequireAuthProps {
  children: JSX.Element;
  roles?: UserRole[];
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ 
  children, 
  roles = [] 
}) => {
  const { user, isLoading, userRole } = useAuth();
  const location = useLocation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPermission = () => {
      if (!user) {
        setHasPermission(false);
        return;
      }

      // No role restriction, just require authentication
      if (!roles || roles.length === 0) {
        setHasPermission(true);
        return;
      }

      // Admin and owner roles have access to everything
      if (userRole === 'admin' || userRole === 'owner') {
        setHasPermission(true);
        return;
      }

      // Check if user has any of the required roles
      const hasRole = roles.includes(userRole as UserRole);
      
      if (!hasRole) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this resource",
          variant: "destructive",
        });
      }
      
      setHasPermission(hasRole);
    };

    if (!isLoading) {
      checkPermission();
    }
  }, [user, isLoading, roles, userRole]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (hasPermission === false) {
    // If not authenticated, redirect to login
    if (!user) {
      return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }
    
    // If authenticated but lacking permission, redirect to unauthorized
    return <Navigate to="/unauthorized" replace />;
  }

  // Wait until permission check is complete
  if (hasPermission === null) {
    return <LoadingScreen />;
  }

  return children;
};
