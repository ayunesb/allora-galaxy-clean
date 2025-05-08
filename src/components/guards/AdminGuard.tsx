
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import LoadingScreen from '@/components/LoadingScreen';

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * Guard component to protect admin routes
 * Only allows access if user has admin role
 */
const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { tenant, isLoading } = useWorkspace();
  
  // Show loading while checking role
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  // Redirect to unauthorized page if user doesn't have admin role
  if (!tenant?.role || !['admin', 'owner'].includes(tenant.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Return children if user has admin role
  return <>{children}</>;
};

export default AdminGuard;
