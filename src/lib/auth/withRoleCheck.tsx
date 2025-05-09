import React, { ComponentType } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Skeleton } from '@/components/ui/skeleton';

interface WithRoleCheckOptions {
  roles?: string[];
  redirectPath?: string;
}

export function withRoleCheck<P extends object>(
  Component: ComponentType<P>,
  options: WithRoleCheckOptions = {}
) {
  const { roles = [], redirectPath = '/' } = options;

  const WithRoleCheck: React.FC<P> = (props) => {
    const { user, loading: authLoading } = useAuth();
    const { userRole, loading: workspaceLoading } = useWorkspace();
    
    const loading = authLoading || workspaceLoading;
    
    // Show loading state
    if (loading) {
      return (
        <div className="container mx-auto py-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <div className="grid grid-cols-2 gap-4 mt-8">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      );
    }
    
    // If no user, redirect to login
    if (!user) {
      return <Navigate to="/auth/login" replace />;
    }
    
    // If no roles specified, allow access
    if (roles.length === 0) {
      return <Component {...props} />;
    }
    
    // If user role matches required roles, allow access
    if (userRole && roles.includes(userRole)) {
      return <Component {...props} />;
    }
    
    // Otherwise, redirect to specified path
    return <Navigate to={redirectPath} replace />;
  };

  return WithRoleCheck;
}

export default withRoleCheck;
