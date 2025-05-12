
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { useTenantRole } from '@/hooks/useTenantRole';
import { UserRole } from '@/types/user';

export interface RequireRoleProps {
  children: React.ReactNode;
  roles: UserRole[];
}

export const RequireRole: React.FC<RequireRoleProps> = ({ children, roles }) => {
  const { user } = useAuth();
  const { role, loading } = useTenantRole();
  const location = useLocation();

  // Show loading state
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check if user has the required role
  if (role && roles.includes(role as UserRole)) {
    return <>{children}</>;
  }

  // User doesn't have the required role, redirect to unauthorized
  return <Navigate to="/unauthorized" state={{ from: location }} replace />;
};
