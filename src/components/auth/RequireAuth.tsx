
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export interface RequireAuthProps {
  children: React.ReactNode;
  roles?: string[];
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children, roles }) => {
  const { user, isLoading: authLoading } = useAuth();
  const { userRole, isLoading: workspaceLoading } = useWorkspace();
  const location = useLocation();

  const isLoading = authLoading || workspaceLoading;

  // When loading, show a loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If roles are specified, check if user has the required role
  if (roles && roles.length > 0) {
    if (!userRole || !roles.includes(userRole)) {
      // User doesn't have the required role, redirect to unauthorized
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
  }

  // User is authenticated and has the required role (if specified)
  return <>{children}</>;
};

export default RequireAuth;
