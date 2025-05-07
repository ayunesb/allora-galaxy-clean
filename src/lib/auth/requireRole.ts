
import { supabase } from '@/integrations/supabase/client';
import { notifyError } from '@/components/ui/BetterToast';

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer' | 'pending';

const roleHierarchy: Record<UserRole, number> = {
  'owner': 4,
  'admin': 3,
  'member': 2,
  'viewer': 1,
  'pending': 0
};

/**
 * Utility function to check if a user has a required role or higher
 * @param requiredRole - The minimum role required
 * @returns boolean indicating if the user meets or exceeds the required role
 */
export function requireRole(requiredRole: UserRole): boolean {
  const { currentRole } = useWorkspace();
  
  // If no role, the user doesn't have sufficient permissions
  if (!currentRole) {
    return false;
  }
  
  const userRoleLevel = roleHierarchy[currentRole as UserRole];
  const requiredRoleLevel = roleHierarchy[requiredRole];
  
  // User role meets or exceeds the required role
  return userRoleLevel >= requiredRoleLevel;
}

/**
 * Get the display name of a role
 * @param role - The role to get the display name for
 * @returns - The display name of the role
 */
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'owner':
      return 'Owner';
    case 'admin':
      return 'Administrator';
    case 'member':
      return 'Member';
    case 'viewer':
      return 'Viewer';
    case 'pending':
      return 'Pending';
    default:
      return 'Unknown';
  }
}

/**
 * Server-side role check utility
 * @param tenant_id The tenant ID to check roles for
 * @param role The role required or array of roles where any match is sufficient
 * @returns A promise that resolves to boolean indicating if the user has the required role
 */
export async function requireRoleAsync(
  tenant_id: string,
  role: UserRole | UserRole[]
): Promise<boolean> {
  try {
    if (!tenant_id) {
      console.error('requireRoleAsync: tenant_id is required');
      return false;
    }

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('requireRoleAsync: Failed to get user:', userError?.message);
      return false;
    }
    
    // Get the user's roles for the specified tenant
    const { data: roleData, error } = await supabase
      .from('tenant_user_roles')
      .select('role')
      .eq('tenant_id', tenant_id)
      .eq('user_id', user.id)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking user role:', error);
      return false;
    }
    
    if (!roleData) {
      console.error(`User has no role for tenant ${tenant_id}`);
      return false;
    }
    
    // Check if the user has the required role
    const userRole = roleData.role as UserRole;
    const userRoleLevel = roleHierarchy[userRole];
    
    if (Array.isArray(role)) {
      // Check if user has any of the required roles or higher
      const requiredLevels = role.map(r => roleHierarchy[r]);
      const minimumRequiredLevel = Math.min(...requiredLevels);
      return userRoleLevel >= minimumRequiredLevel;
    }
    
    // Check against a single required role
    const requiredRoleLevel = roleHierarchy[role];
    return userRoleLevel >= requiredRoleLevel;
  } catch (err) {
    console.error('Error in requireRoleAsync:', err);
    return false;
  }
}

/**
 * Higher-order function that wraps an async function to require a specific role
 * @param fn The function to wrap
 * @param tenant_id The tenant ID to check roles for
 * @param role The role required or array of roles where any match is sufficient
 * @returns A function that will only execute if the user has the required role
 */
export function withRequiredRole<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  tenant_id: string,
  role: UserRole | UserRole[]
): (...args: T) => Promise<R | void> {
  return async (...args: T): Promise<R | void> => {
    try {
      const hasRole = await requireRoleAsync(tenant_id, role);
      
      if (!hasRole) {
        notifyError('Access Denied', 'You do not have permission to perform this action.');
        return;
      }
      
      return fn(...args);
    } catch (error) {
      console.error('Error in withRequiredRole:', error);
      notifyError('Error', 'An unexpected error occurred while checking your permissions.');
      return;
    }
  };
}

// Import inside the file to prevent circular dependencies
import { useWorkspace } from '@/context/WorkspaceContext';
