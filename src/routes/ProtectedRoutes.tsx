
import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import MainLayout from '@/components/layout/MainLayout';
import LoadingScreen from '@/components/LoadingScreen';
import { SidebarProvider } from '@/components/ui/sidebar';

/**
 * Protected routes wrapper component
 * - Ensures user is authenticated
 * - Redirects to login if not authenticated
 * - Provides Workspace context to all child routes
 */
const ProtectedRoutes: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    // Redirect to login page with current location as intended destination
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return (
    <SidebarProvider>
      <WorkspaceProvider>
        <MainLayout>
          <Outlet />
        </MainLayout>
      </WorkspaceProvider>
    </SidebarProvider>
  );
};

export default ProtectedRoutes;
