
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RequireAuthProps {
  children: JSX.Element;
  roles?: string[];
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children, roles }) => {
  const { user, isLoading, userRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If roles are specified, check if user has required role
  if (roles && roles.length > 0) {
    if (!userRole || !roles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};
