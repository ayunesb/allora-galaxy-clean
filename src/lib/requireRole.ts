
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
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }
    
    // Get the user's roles for the specified tenant
    const { data: roleData, error } = await supabase
      .from('tenant_user_roles')
      .select('role')
      .eq('tenant_id', tenant_id)
      .eq('user_id', user.id)
      .single();
      
    if (error || !roleData) {
      console.error('Error checking user role:', error);
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
    const hasRole = await requireRole(tenant_id, role);
    
    if (!hasRole) {
      notifyError('Access Denied', 'You do not have permission to perform this action.');
      return;
    }
    
    return fn(...args);
  };
}
