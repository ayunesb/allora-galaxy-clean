
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { userRole, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (userRole !== 'admin' && userRole !== 'owner') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

export default AdminGuard;
