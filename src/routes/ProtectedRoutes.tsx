
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import MainLayout, { MainLayoutProps } from '@/layouts/MainLayout';
import AdminLayout, { AdminLayoutProps } from '@/layouts/AdminLayout';
import LoadingScreen from '@/components/LoadingScreen';
import useRoleCheck from '@/lib/auth/useRoleCheck';

interface ProtectedRouteProps {
  requiredRole?: 'owner' | 'admin' | 'member' | 'viewer' | Array<'owner' | 'admin' | 'member' | 'viewer'>;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRole,
  redirectTo = '/auth',
}) => {
  const { user, loading: authLoading } = useAuth();
  const { initialized: workspaceInitialized } = useWorkspace();
  
  // Show loading screen while authentication is in progress
  if (authLoading || !workspaceInitialized) {
    return <LoadingScreen />;
  }
  
  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // If there's no required role, just render the children
  return <Outlet />;
};

export const MainRoute: React.FC = () => {
  const layoutProps: MainLayoutProps = {
    children: <Outlet />
  };
  
  return (
    <MainLayout {...layoutProps} />
  );
};

export const AdminRoute: React.FC = () => {
  const { hasAccess, checking } = useRoleCheck({
    requiredRole: ['owner', 'admin'],
    redirectTo: '/dashboard'
  });
  
  if (checking) {
    return <LoadingScreen />;
  }
  
  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }
  
  const layoutProps: AdminLayoutProps = {
    children: <Outlet />
  };
  
  return (
    <AdminLayout {...layoutProps} />
  );
};

// Add other specialized routes as needed
