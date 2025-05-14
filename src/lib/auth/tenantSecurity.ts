
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

/**
 * Checks if a user is a member of a specified tenant
 */
export async function isTenantMember(tenantId: string): Promise<boolean> {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return false;
    }
    
    // Check tenant membership using the tenant_user_roles table
    const { data, error } = await supabase
      .from('tenant_user_roles')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('user_id', session.user.id)
      .single();
    
    if (error) {
      console.error('Error checking tenant membership:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in isTenantMember:', error);
    return false;
  }
}

/**
 * Checks if a user has a specific role within a tenant
 */
export async function hasTenantRole(tenantId: string, roles: string[]): Promise<boolean> {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return false;
    }
    
    // Check role in tenant
    const { data, error } = await supabase
      .from('tenant_user_roles')
      .select('role')
      .eq('tenant_id', tenantId)
      .eq('user_id', session.user.id)
      .single();
    
    if (error) {
      console.error('Error checking tenant role:', error);
      return false;
    }
    
    return roles.includes(data.role);
  } catch (error) {
    console.error('Error in hasTenantRole:', error);
    return false;
  }
}

/**
 * Verifies tenant access and displays appropriate warnings
 */
export async function verifyTenantAccess(
  tenantId: string, 
  requiredRole?: string[],
  redirectOnFailure = true
): Promise<boolean> {
  try {
    // First check membership
    const isMember = await isTenantMember(tenantId);
    
    if (!isMember) {
      if (redirectOnFailure) {
        toast({
          title: "Access Denied",
          description: "You are not a member of this workspace",
          variant: "destructive",
        });
      }
      return false;
    }
    
    // If specific role required, check that too
    if (requiredRole && requiredRole.length > 0) {
      const hasRole = await hasTenantRole(tenantId, requiredRole);
      
      if (!hasRole) {
        if (redirectOnFailure) {
          toast({
            title: "Insufficient Permissions",
            description: `You need ${requiredRole.join(' or ')} permissions to access this resource`,
            variant: "destructive",
          });
        }
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error verifying tenant access:', error);
    return false;
  }
}
