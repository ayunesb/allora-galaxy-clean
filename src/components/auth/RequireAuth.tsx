
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface RequireAuthProps {
  children: React.ReactNode;
  roles?: string[];
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page if not authenticated
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If roles are specified, check if user has one of those roles
  if (roles && roles.length > 0) {
    // This is a simplified role check - in a real app, you'd check against user.role
    // or make an API call to check roles
    const hasRequiredRole = true; // Replace with actual role check logic
    
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};
