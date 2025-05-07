
import { useWorkspace } from '@/context/WorkspaceContext';
import { Navigate } from 'react-router-dom';

/**
 * A higher-order component that restricts access to a page based on the user's role
 * 
 * @param allowedRoles - Array of roles that are allowed to access the page
 * @param Component - The component to render if the user has access
 * @param redirectTo - Where to redirect if the user doesn't have access, defaults to /unauthorized
 * @returns The Component if authorized, otherwise redirects
 */
export const requireRole = (allowedRoles: string[], Component: React.ComponentType, redirectTo = '/unauthorized') => {
  const RequireRoleWrapper = (props: any) => {
    const { currentRole, loading } = useWorkspace();
    
    if (loading) {
      return <div>Loading...</div>;
    }
    
    const hasAccess = currentRole && allowedRoles.includes(currentRole);
    
    if (!hasAccess) {
      return <Navigate to={redirectTo} replace />;
    }
    
    return <Component {...props} />;
  };
  
  return RequireRoleWrapper;
};

export default requireRole;
