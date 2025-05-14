
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingScreen from '@/components/LoadingScreen';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface RequireAuthProps {
  children: React.ReactNode;
  roles?: string[];
  redirectTo?: string;
}

export function RequireAuth({ 
  children, 
  roles = [], 
  redirectTo = '/auth/login' 
}: RequireAuthProps) {
  const location = useLocation();
  const { user, isAuthenticated, isLoading, userRoles } = useAuth();
  const { isLoading: isWorkspaceLoading } = useWorkspace();

  // Show loading when checking auth
  if (isLoading || isWorkspaceLoading) {
    return <LoadingScreen />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If roles are specified and user doesn't have required role, redirect to unauthorized
  if (roles.length > 0 && !userRoles.some(role => roles.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and has required roles, render children
  return <>{children}</>;
}
