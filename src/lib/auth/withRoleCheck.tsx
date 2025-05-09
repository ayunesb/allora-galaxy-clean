
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { useTenantRole } from '@/hooks/useTenantRole';

export interface WithRoleCheckProps {
  roles: string[];
}

export const withRoleCheck = <P extends {}>(
  Component: React.ComponentType<P>,
  { roles }: WithRoleCheckProps
) => {
  const WithRoleCheck: React.FC<P> = (props) => {
    const { user } = useAuth();
    const { role, loading } = useTenantRole();
    const location = useLocation();

    // Show loading state
    if (loading) {
      return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    // If user is not authenticated, redirect to login
    if (!user) {
      return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    // Check if user has the required role
    if (role && roles.includes(role)) {
      return <Component {...props} />;
    }

    // User doesn't have the required role, redirect to unauthorized
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  };

  return WithRoleCheck;
};

export default withRoleCheck;
