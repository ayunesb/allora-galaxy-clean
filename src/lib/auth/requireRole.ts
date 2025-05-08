
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { UserRole } from '@/types/shared';

interface RequireRoleProps {
  requiredRoles: UserRole[];
  children: ReactNode;
  fallbackPath?: string;
}

/**
 * Component guard to restrict access based on user role
 * @param requiredRoles Array of allowed roles
 * @param children React children to render if role check passes
 * @param fallbackPath Redirect path if role check fails (defaults to /unauthorized)
 */
export const RequireRole = ({
  requiredRoles,
  children,
  fallbackPath = '/unauthorized',
}: RequireRoleProps) => {
  const { userRole, loading } = useWorkspace();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userRole || !requiredRoles.includes(userRole)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

/**
 * Higher-order function for backward compatibility
 * This ensures existing code using requireRole() still works
 */
export const requireRole = (
  requiredRoles: UserRole[],
  children: ReactNode,
  fallbackPath: string = '/unauthorized'
) => {
  return (
    <RequireRole requiredRoles={requiredRoles} fallbackPath={fallbackPath}>
      {children}
    </RequireRole>
  );
};

export default RequireRole;
