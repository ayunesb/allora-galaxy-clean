
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface RequireAuthProps {
  children: React.ReactNode;
  role?: string;
  redirectTo?: string;
}

const RequireAuth: React.FC<RequireAuthProps> = ({
  children,
  role,
  redirectTo = '/login'
}) => {
  const { user, isLoading, hasRole } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to access this page",
        variant: "destructive"
      });
    } else if (!isLoading && role && !hasRole(role)) {
      toast({
        title: "Access denied",
        description: `You need ${role} permissions to access this page`,
        variant: "destructive"
      });
    }
  }, [isLoading, user, role, hasRole, toast]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (role && !hasRole(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
