
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { UserRole } from './roleTypes';

interface RoleCheckOptions {
  roles: UserRole[];
  redirectTo?: string;
}

/**
 * Higher-order component that checks if the user has the required role
 * before rendering the component.
 */
export function withRoleCheck<T extends object>(
  Component: React.ComponentType<T>,
  options: RoleCheckOptions
) {
  const WithRoleCheck: React.FC<T> = (props) => {
    const { user, isLoading: authLoading } = useAuth();
    const { userRole, isLoading: workspaceLoading } = useWorkspace();
    
    const { roles, redirectTo = '/unauthorized' } = options;
    const isLoading = authLoading || workspaceLoading;
    
    if (isLoading) {
      // Return a loading state
      return <div>Loading...</div>;
    }
    
    // Check if user is logged in
    if (!user) {
      return <Navigate to="/auth/login" replace />;
    }
    
    // Check if user has the required role
    if (!userRole || !roles.includes(userRole as UserRole)) {
      return <Navigate to={redirectTo} replace />;
    }
    
    // User has the required role, render the component
    return <Component {...props} />;
  };
  
  return WithRoleCheck;
}

export default withRoleCheck;
