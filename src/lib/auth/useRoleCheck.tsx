
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { UserRole } from '@/types/shared';
import { useState, useEffect } from 'react';

interface UseRoleCheckOptions {
  requiredRole?: UserRole | UserRole[];
}

/**
 * Hook to check if user has required role
 * @param options Object containing requiredRole(s) 
 * @returns Object with hasAccess, checking and error properties
 */
export const useRoleCheck = (options: UseRoleCheckOptions) => {
  const { userRole, loading } = useWorkspace();
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Reset state when dependencies change
    setError(null);
    
    if (!options.requiredRole) {
      setHasAccess(true);
      return;
    }

    if (!loading && userRole) {
      const requiredRoles = Array.isArray(options.requiredRole) 
        ? options.requiredRole 
        : [options.requiredRole];
        
      // Check if user has any of the required roles
      const hasRequiredRole = requiredRoles.includes(userRole);
      setHasAccess(hasRequiredRole);
      
      if (!hasRequiredRole) {
        setError(`Access denied. Required role: ${requiredRoles.join(' or ')}`);
      }
    }
  }, [options.requiredRole, userRole, loading]);
  
  return { 
    hasAccess, 
    checking: loading, 
    error 
  };
};
