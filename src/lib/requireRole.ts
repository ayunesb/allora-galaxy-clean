
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { UserRole } from '@/lib/auth/roleTypes';

/**
 * Check if the current user has the required role
 */
export function hasRequiredRole(requiredRole: UserRole | UserRole[]): boolean {
  const { currentRole } = useWorkspace();
  
  if (!currentRole) {
    return false;
  }
  
  const roleHierarchy: Record<string, number> = {
    'owner': 4,
    'admin': 3,
    'member': 2,
    'viewer': 1
  };
  
  const userRoleValue = roleHierarchy[currentRole] || 0;
  
  if (Array.isArray(requiredRole)) {
    const requiredValues = requiredRole.map(role => roleHierarchy[role] || 0);
    const minimumRequired = Math.min(...requiredValues);
    return userRoleValue >= minimumRequired;
  }
  
  return userRoleValue >= (roleHierarchy[requiredRole] || 0);
}
