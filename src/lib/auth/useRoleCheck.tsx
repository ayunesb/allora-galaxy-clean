
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { UserRole } from '@/types/shared';

/**
 * Hook to check if user has required role
 * @param requiredRoles Array of allowed roles
 * @returns Object with hasRole and isLoading properties
 */
export const useRoleCheck = (requiredRoles: UserRole[]) => {
  const { userRole, loading } = useWorkspace();
  
  // Check if user has any of the required roles
  const hasRole = !!userRole && requiredRoles.includes(userRole);
  
  return { hasRole, isLoading: loading };
};
