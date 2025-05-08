
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { userRole, isLoading } = useWorkspace();

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // Check if user has admin role
  if (userRole !== 'admin' && userRole !== 'owner') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
