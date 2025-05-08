
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import MainLayout from '@/layouts/MainLayout';
import AdminLayout from '@/layouts/AdminLayout';
import LoadingScreen from '@/components/LoadingScreen';
import { hasRequiredRole } from '@/lib/requireRole';

interface ProtectedRouteProps {
  requiredRole?: 'owner' | 'admin' | 'member' | 'viewer' | Array<'owner' | 'admin' | 'member' | 'viewer'>;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRole,
  redirectTo = '/auth',
}) => {
  const { user, loading: authLoading } = useAuth();
  const { loading: workspaceLoading } = useWorkspace();
  
  // Show loading screen while authentication is in progress
  if (authLoading || workspaceLoading) {
    return <LoadingScreen />;
  }
  
  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // If there's a required role, check if user has that role
  if (requiredRole) {
    const hasAccess = hasRequiredRole(requiredRole);
    
    if (!hasAccess) {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  // If there's no required role, just render the children
  return <Outlet />;
};

export const MainRoute: React.FC = () => {
  return <MainLayout />;
};

export const AdminRoute: React.FC = () => {
  const { loading } = useWorkspace();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  // Check if the user has admin privileges
  const hasAccess = hasRequiredRole(['owner', 'admin']);
  
  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <AdminLayout />;
};
