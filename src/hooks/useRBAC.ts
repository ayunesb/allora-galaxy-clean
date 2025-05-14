
import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/contexts/WorkspaceContext'; 
import { useTenantRole } from '@/hooks/useTenantRole';
import { UserRole } from '@/types/shared';

interface RBACHookReturn {
  hasGlobalRole: (requiredRoles: UserRole[] | UserRole) => boolean;
  hasTenantRole: (requiredRoles: UserRole[] | UserRole) => boolean;
  isOwner: () => boolean;
  isAdmin: () => boolean;
  canCreateResource: (resource: string) => boolean;
  canEditResource: (resource: string) => boolean;
  canDeleteResource: (resource: string) => boolean;
}

/**
 * Hook to check user permissions and roles
 * Provides methods to verify if user has specific permissions
 */
export function useRBAC(): RBACHookReturn {
  const { userRole } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { role: tenantRole } = useTenantRole(currentWorkspace?.id);
  
  /**
   * Check if user has global role (from auth context)
   */
  const hasGlobalRole = useCallback((requiredRoles: UserRole[] | UserRole): boolean => {
    if (!userRole) return false;
    
    // Admin and owner have access to everything
    if (userRole === 'admin' || userRole === 'owner') return true;
    
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.includes(userRole as UserRole);
  }, [userRole]);
  
  /**
   * Check if user has tenant-specific role
   */
  const hasTenantRole = useCallback((requiredRoles: UserRole[] | UserRole): boolean => {
    if (!tenantRole) return false;
    
    // Admin and owner have access to everything
    if (tenantRole === 'admin' || tenantRole === 'owner') return true;
    
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.includes(tenantRole as UserRole);
  }, [tenantRole]);
  
  /**
   * Check if user is owner (globally or in current tenant)
   */
  const isOwner = useCallback((): boolean => {
    return userRole === 'owner' || tenantRole === 'owner';
  }, [userRole, tenantRole]);
  
  /**
   * Check if user is admin (globally or in current tenant)
   */
  const isAdmin = useCallback((): boolean => {
    return userRole === 'admin' || userRole === 'owner' || 
           tenantRole === 'admin' || tenantRole === 'owner';
  }, [userRole, tenantRole]);
  
  /**
   * Determine if user can create a specific resource
   * @param resource The resource type to check permissions for
   */
  const canCreateResource = useCallback((resource: string): boolean => {
    // Default permissions based on resource type
    switch (resource) {
      case 'strategy':
        return hasTenantRole(['owner', 'admin', 'member']);
      case 'plugin':
        return hasTenantRole(['owner', 'admin']);
      case 'apiKey':
        return hasTenantRole(['owner', 'admin']);
      case 'user':
        return hasTenantRole(['owner', 'admin']);
      default:
        return isAdmin();
    }
  }, [hasTenantRole, isAdmin]);
  
  /**
   * Determine if user can edit a specific resource
   * @param resource The resource type to check permissions for
   */
  const canEditResource = useCallback((resource: string): boolean => {
    // Default permissions based on resource type
    switch (resource) {
      case 'strategy':
        return hasTenantRole(['owner', 'admin', 'member']);
      case 'plugin':
        return hasTenantRole(['owner', 'admin']);
      case 'profile':
        return true; // Users can always edit their own profile
      default:
        return isAdmin();
    }
  }, [hasTenantRole, isAdmin]);
  
  /**
   * Determine if user can delete a specific resource
   * @param resource The resource type to check permissions for
   */
  const canDeleteResource = useCallback((resource: string): boolean => {
    // Default permissions based on resource type
    switch (resource) {
      case 'strategy':
        return hasTenantRole(['owner', 'admin']);
      case 'plugin':
        return hasTenantRole(['owner', 'admin']);
      case 'apiKey':
        return hasTenantRole(['owner', 'admin']);
      default:
        return isAdmin();
    }
  }, [hasTenantRole, isAdmin]);
  
  return {
    hasGlobalRole,
    hasTenantRole,
    isOwner,
    isAdmin,
    canCreateResource,
    canEditResource,
    canDeleteResource
  };
}

export default useRBAC;
