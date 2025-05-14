
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingScreen } from '@/components/LoadingScreen';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user || !isAdmin) {
    // Redirect non-admin users to unauthorized page
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default AdminGuard;
