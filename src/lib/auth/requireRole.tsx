
import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '@/types/shared';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface RequireRoleProps {
  children: React.ReactNode;
  roles?: UserRole[];
  redirectTo?: string;
}

export const RequireRole: React.FC<RequireRoleProps> = ({
  children,
  roles = ['member', 'admin', 'owner'],
  redirectTo = '/unauthorized'
}) => {
  const { user, loading: authLoading } = useAuth();
  const { userRole, loading: workspaceLoading } = useWorkspace();
  
  // Show loading indicator while checking authentication and workspace
  if (authLoading || workspaceLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }
  
  // Redirect if not authorized
  if (!userRole || !roles.includes(userRole)) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // Render children if authorized
  return <>{children}</>;
};

export default RequireRole;
