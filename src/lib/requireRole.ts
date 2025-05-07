
import { supabase } from '@/integrations/supabase/client';
import { notifyError } from '@/components/ui/BetterToast';
import { useWorkspace } from '@/context/WorkspaceContext';

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

const roleHierarchy: Record<UserRole, number> = {
  'owner': 4,
  'admin': 3,
  'member': 2,
  'viewer': 1,
};

/**
 * Checks if a user has the required role within the specified tenant using RLS security definer functions
 * @param tenant_id The tenant ID to check roles for
 * @param role The role required or array of roles where any match is sufficient
 * @returns A promise that resolves to boolean indicating if the user has the required role
 */
export async function requireRole(
  tenant_id: string,
  role: UserRole | UserRole[]
): Promise<boolean> {
  try {
    if (!tenant_id) {
      console.error('requireRole: tenant_id is required');
      return false;
    }

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('requireRole: Failed to get user:', userError?.message);
      return false;
    }
    
    // Use security definer function to check if user is admin
    if (Array.isArray(role) && (role.includes('admin') || role.includes('owner'))) {
      const { data, error } = await supabase.rpc('is_tenant_admin', { tenant_id });
      
      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
      
      if (data === true) {
        return true;
      }
    }
    
    // Check if user has the specific role
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
    
    const userRoleLevel = roleHierarchy[roleData.role as UserRole] || 0;
    
    // Check if the user has the required role
    if (Array.isArray(role)) {
      // Find the minimum required level from the array of roles
      const minimumRequiredLevel = Math.min(
        ...role.map(r => roleHierarchy[r] || Number.MAX_SAFE_INTEGER)
      );
      return userRoleLevel >= minimumRequiredLevel;
    }
    
    // Check against a single role
    const requiredRoleLevel = roleHierarchy[role] || Number.MAX_SAFE_INTEGER;
    return userRoleLevel >= requiredRoleLevel;
  } catch (err) {
    console.error('Error in requireRole:', err);
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
      const hasRole = await requireRole(tenant_id, role);
      
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

/**
 * Hook that returns the current user's role level (0-4)
 * @returns The user's role level or 0 if not authenticated
 */
export function useRoleLevel(): number {
  const { currentRole } = useWorkspace();
  return currentRole ? (roleHierarchy[currentRole as UserRole] || 0) : 0;
}

/**
 * Check if the current user's role meets or exceeds the required role
 * @param requiredRole The minimum role level required
 * @returns Boolean indicating if user meets the requirement
 */
export function hasRequiredRole(requiredRole: UserRole | UserRole[]): boolean {
  const { currentRole } = useWorkspace();
  
  if (!currentRole) {
    return false;
  }
  
  const userRoleLevel = roleHierarchy[currentRole as UserRole] || 0;
  
  if (Array.isArray(requiredRole)) {
    const minimumRequiredLevel = Math.min(
      ...requiredRole.map(r => roleHierarchy[r] || Number.MAX_SAFE_INTEGER)
    );
    return userRoleLevel >= minimumRequiredLevel;
  }
  
  const requiredRoleLevel = roleHierarchy[requiredRole] || Number.MAX_SAFE_INTEGER;
  return userRoleLevel >= requiredRoleLevel;
}
