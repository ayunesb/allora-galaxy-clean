
import { supabase } from '@/integrations/supabase/client';
import { Tenant } from '@/contexts/workspace/types';

/**
 * Check if the user has existing tenants
 */
export async function checkExistingTenants(userId: string): Promise<Tenant[] | null> {
  try {
    // First get tenant_ids from tenant_user_roles
    const { data: userTenants, error: userTenantsError } = await supabase
      .from('tenant_user_roles')
      .select('tenant_id, role')
      .eq('user_id', userId);
    
    if (userTenantsError) {
      console.error('Error checking tenants:', userTenantsError);
      return null;
    }
    
    if (!userTenants || userTenants.length === 0) {
      return [];
    }
    
    // Now fetch the tenant details without using RLS
    // Create an array of tenant_ids
    const tenantIds = userTenants.map(ut => ut.tenant_id);
    
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, name, slug')
      .in('id', tenantIds);
    
    if (tenantsError) {
      console.error('Error checking tenants:', tenantsError);
      return null;
    }
    
    // Combine tenant details with roles
    return tenants.map(tenant => {
      const userTenant = userTenants.find(ut => ut.tenant_id === tenant.id);
      return {
        ...tenant,
        role: userTenant?.role
      };
    });
  } catch (error) {
    console.error('Error checking tenants:', error);
    return null;
  }
}

/**
 * Create a new tenant for a user
 */
export async function createTenant(
  userId: string,
  name: string,
  metadata: Record<string, any> = {}
): Promise<string | null> {
  try {
    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Create tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name,
        slug,
        owner_id: userId,
        metadata
      })
      .select('id')
      .single();
    
    if (tenantError) {
      console.error('Error creating tenant:', tenantError);
      return null;
    }
    
    if (!tenant) {
      console.error('No tenant created');
      return null;
    }
    
    // Connect user to tenant with owner role
    const { error: roleError } = await supabase
      .from('tenant_user_roles')
      .insert({
        tenant_id: tenant.id,
        user_id: userId,
        role: 'owner'
      });
    
    if (roleError) {
      console.error('Error assigning role:', roleError);
      // Clean up tenant
      await supabase.from('tenants').delete().eq('id', tenant.id);
      return null;
    }
    
    return tenant.id;
  } catch (error) {
    console.error('Error creating tenant:', error);
    return null;
  }
}
