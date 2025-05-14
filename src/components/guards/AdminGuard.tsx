
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { LoadingScreen } from '@/components/LoadingScreen';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { userRole, isLoading } = useWorkspace();

  // Show loading screen while determining user role
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Redirect if user doesn't have admin or owner role
  if (userRole !== 'admin' && userRole !== 'owner') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
