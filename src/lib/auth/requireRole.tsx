
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import LoadingScreen from '@/components/LoadingScreen';
import { UserRole } from '@/types/shared';

interface RequireRoleProps {
  children: React.ReactNode;
  roles: UserRole[];
  redirectTo?: string;
}

export const RequireRole: React.FC<RequireRoleProps> = ({ 
  children, 
  roles,
  redirectTo = '/dashboard'
}) => {
  const { userRole, isLoading } = useWorkspace();
  
  // Show loading screen while we check roles
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  // If user doesn't have the required role, redirect
  if (!userRole || !roles.includes(userRole)) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // User has required role, render children
  return <>{children}</>;
};

export default RequireRole;
