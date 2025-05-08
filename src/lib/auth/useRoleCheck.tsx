
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { UserRole } from '@/types/shared';
import { useState, useEffect } from 'react';
import { checkRolePermission } from './roleTypes';

interface UseRoleCheckOptions {
  requiredRole?: UserRole | UserRole[];
  silent?: boolean;
}

/**
 * Hook to check if user has required role
 * @param options Object containing requiredRole(s) and silent option
 * @returns Object with hasAccess, checking and error properties
 */
export const useRoleCheck = (options: UseRoleCheckOptions = {}) => {
  const { userRole, loading } = useWorkspace();
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Reset state when dependencies change
    setError(null);
    
    if (!options.requiredRole) {
      // No role requirement means everyone has access
      setHasAccess(true);
      return;
    }

    if (!loading) {
      if (!userRole) {
        setHasAccess(false);
        if (!options.silent) {
          setError('User role not available. Please log in to continue.');
        }
        return;
      }
      
      // Use the helper function from roleTypes to check permissions based on role hierarchy
      const hasRequiredRole = checkRolePermission(userRole, options.requiredRole);
      setHasAccess(hasRequiredRole);
      
      if (!hasRequiredRole && !options.silent) {
        const requiredRoles = Array.isArray(options.requiredRole) 
          ? options.requiredRole.join(' or ')
          : options.requiredRole;
          
        setError(`Access denied. Required role: ${requiredRoles}`);
      }
    }
  }, [options.requiredRole, userRole, loading, options.silent]);
  
  return { 
    hasAccess, 
    checking: loading, 
    error 
  };
};

export default useRoleCheck;
