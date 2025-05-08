
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { UserRole } from '@/types/shared';

/**
 * Higher-order component to restrict access based on user role
 * @param requiredRoles Array of allowed roles
 * @param children React children
 * @param fallbackPath Redirect path if role check fails
 */
export const requireRole = (
  requiredRoles: UserRole[],
  children: ReactNode,
  fallbackPath: string = '/unauthorized'
) => {
  const { userRole, loading } = useWorkspace();
  
  // Show loading while checking role
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Check if user has required role
  if (!userRole || !requiredRoles.includes(userRole)) {
    return <Navigate to={fallbackPath} replace />;
  }
  
  // Return children if role check passes
  return <>{children}</>;
};
