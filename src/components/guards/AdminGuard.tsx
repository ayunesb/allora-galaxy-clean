
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import LoadingScreen from '@/components/LoadingScreen';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { userRole, isLoading } = useWorkspace();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (userRole !== 'admin' && userRole !== 'owner') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

export default AdminGuard;
