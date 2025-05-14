
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from '@/components/LoadingScreen';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // Check if user is authenticated and has admin role
  const isAdmin = userRole === 'admin' || userRole === 'owner';
  if (!user || !isAdmin) {
    // Redirect non-admin users to unauthorized page
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default AdminGuard;
