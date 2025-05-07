
import { supabase } from '@/integrations/supabase/client';
import { notifyError } from '@/components/ui/BetterToast';

/**
 * Checks if a user has the required role within the specified tenant
 * @param tenant_id The tenant ID to check roles for
 * @param role The role required or array of roles where any match is sufficient
 * @returns A promise that resolves to boolean indicating if the user has the required role
 */
export async function requireRole(
  tenant_id: string,
  role: string | string[]
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
    if (Array.isArray(role)) {
      return role.includes(roleData.role);
    }
    
    return roleData.role === role;
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
  role: string | string[]
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
