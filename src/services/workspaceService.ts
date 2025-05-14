
import { supabaseWithErrorHandler } from '@/lib/supabase';
import { Tenant, CreateTenantInput } from '@/types/tenant';

/**
 * Fetches all workspaces (tenants) accessible to the current user
 * @returns Promise resolving to an array of tenant objects
 */
export const fetchWorkspaces = async (): Promise<Tenant[]> => {
  try {
    // Get tenant IDs from tenant_user_roles
    const { data: tenantUserRoles, error: rolesError } = await supabaseWithErrorHandler
      .from('tenant_user_roles')
      .select('tenant_id, role');

    if (rolesError) throw rolesError;
    if (!tenantUserRoles || tenantUserRoles.length === 0) return [];

    // Extract tenant IDs
    const tenantIds = tenantUserRoles.map(r => r.tenant_id);

    // Fetch tenant details
    const { data: tenants, error: tenantsError } = await supabaseWithErrorHandler
      .from('tenants')
      .select('*')
      .in('id', tenantIds);

    if (tenantsError) throw tenantsError;

    // Combine tenant details with roles
    return (tenants || []).map(tenant => {
      const userRole = tenantUserRoles.find(r => r.tenant_id === tenant.id);
      return {
        ...tenant,
        userRole: userRole?.role || null
      };
    });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return [];
  }
};

/**
 * Fetch a single workspace by ID
 * @param id The workspace ID
 * @returns Promise resolving to a workspace object or null
 */
export const fetchWorkspaceById = async (id: string): Promise<Tenant | null> => {
  try {
    const { data, error } = await supabaseWithErrorHandler
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching workspace with ID ${id}:`, error);
    return null;
  }
};

/**
 * Creates a new workspace (tenant)
 * @param input Workspace creation data
 * @returns Promise resolving to the created workspace or null on error
 */
export const createWorkspace = async (input: CreateTenantInput): Promise<Tenant | null> => {
  try {
    const { data: user } = await supabaseWithErrorHandler.auth.getUser();
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const userId = user.user.id;
    
    // Generate slug if not provided
    const tenantSlug = input.slug || input.name.toLowerCase().replace(/\s+/g, '-');

    // Create new tenant
    const { data: tenant, error: tenantError } = await supabaseWithErrorHandler
      .from('tenants')
      .insert([
        { name: input.name, slug: tenantSlug, owner_id: userId }
      ])
      .select()
      .single();

    if (tenantError) throw tenantError;

    // Add user as owner
    const { error: roleError } = await supabaseWithErrorHandler
      .from('tenant_user_roles')
      .insert([
        { tenant_id: tenant.id, user_id: userId, role: 'owner' }
      ]);

    if (roleError) throw roleError;

    return tenant;
  } catch (error) {
    console.error('Error creating workspace:', error);
    return null;
  }
};
