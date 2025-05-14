
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from '../LoadingScreen';

interface RequireAuthProps {
  children: React.ReactNode;
  roles?: string[];
}

export function RequireAuth({ children, roles }: RequireAuthProps) {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    // Redirect them to the /auth/login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If user is authenticated and no specific roles are required, or if we don't have roles functionality
  // then render the children
  if (!roles || roles.length === 0) {
    return <>{children}</>;
  }

  // If roles are required, check if the user has any of the required roles
  // This assumes there's a userRole property in your auth context
  // Implement according to your actual role checking logic
  const { userRole } = useAuth();
  if (!userRole || !roles.includes(userRole)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
