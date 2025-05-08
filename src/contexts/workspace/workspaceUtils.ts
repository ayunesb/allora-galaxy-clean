
import { supabase } from '@/integrations/supabase/client';
import { TenantWithRole } from './types';
import { Tenant } from '@/types/tenant';
import { UserRole } from '@/types/shared';

/**
 * Get all tenants for a user with their role in each tenant
 * @param userId The ID of the user
 * @returns Array of tenants with user roles
 */
export async function getUserTenants(userId: string): Promise<TenantWithRole[]> {
  try {
    // Query tenants that the user has a role in
    const { data: userTenantRoles, error: rolesError } = await supabase
      .from('tenant_user_roles')
      .select('tenant_id, role')
      .eq('user_id', userId);
      
    if (rolesError) throw rolesError;
    if (!userTenantRoles || userTenantRoles.length === 0) return [];
    
    // Get tenant IDs from user roles
    const tenantIds = userTenantRoles.map(role => role.tenant_id);
    
    // Query tenant details
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, name, slug')
      .in('id', tenantIds);
      
    if (tenantsError) throw tenantsError;
    if (!tenants || tenants.length === 0) return [];
    
    // Merge tenant details with roles
    const tenantsWithRoles: TenantWithRole[] = tenants.map(tenant => {
      // Find the role for this tenant
      const userRole = userTenantRoles.find(role => role.tenant_id === tenant.id);
      
      return {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        role: (userRole?.role || 'member') as UserRole
      };
    });
    
    return tenantsWithRoles;
  } catch (error) {
    console.error('Error fetching user tenants:', error);
    throw error;
  }
}

/**
 * Get a tenant by ID with the user's role
 * @param userId The user ID
 * @param tenantId The tenant ID
 */
export async function getUserTenantWithRole(userId: string, tenantId: string): Promise<TenantWithRole | null> {
  try {
    // Get tenant details
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, name, slug')
      .eq('id', tenantId)
      .single();
      
    if (tenantError) throw tenantError;
    if (!tenant) return null;
    
    // Get user's role in the tenant
    const { data: roleData, error: roleError } = await supabase
      .from('tenant_user_roles')
      .select('role')
      .eq('tenant_id', tenantId)
      .eq('user_id', userId)
      .single();
      
    if (roleError && roleError.code !== 'PGRST116') throw roleError; // Ignore not found error
    
    // Create tenant with role
    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      role: (roleData?.role || 'member') as UserRole
    };
  } catch (error) {
    console.error('Error fetching tenant with role:', error);
    return null;
  }
}
