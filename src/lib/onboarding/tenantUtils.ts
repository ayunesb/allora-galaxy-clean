import { supabase } from "@/integrations/supabase/client";
import { Tenant } from "@/types/tenant";

/**
 * Checks if a user has existing tenants
 * @param userId User ID to check
 * @returns Array of tenant data or empty array if none found
 */
export async function checkExistingTenants(userId: string): Promise<Tenant[]> {
  try {
    // Get tenant IDs the user is associated with
    const { data: tenantRoles, error: rolesError } = await supabase
      .from("tenant_user_roles")
      .select("tenant_id, role")
      .eq("user_id", userId);

    if (rolesError) throw rolesError;
    if (!tenantRoles || tenantRoles.length === 0) return [];

    // Get tenant details
    const tenantIds = tenantRoles.map((role) => role.tenant_id);
    const { data: tenants, error: tenantsError } = await supabase
      .from("tenants")
      .select("*")
      .in("id", tenantIds);

    if (tenantsError) throw tenantsError;
    if (!tenants || tenants.length === 0) return [];

    // Add roles to tenant data
    return tenants.map((tenant) => {
      const userRole = tenantRoles.find((role) => role.tenant_id === tenant.id);
      return {
        ...tenant,
        role: userRole?.role,
      };
    });
  } catch (error) {
    console.error("Error checking existing tenants:", error);
    return [];
  }
}

/**
 * Check if a tenant name is available
 * @param tenantName Tenant name to check
 * @returns Boolean indicating if the name is available
 */
export async function isTenantNameAvailable(
  tenantName: string,
): Promise<boolean> {
  try {
    const slug = tenantName.toLowerCase().replace(/\s+/g, "-");

    // Check if tenant with this name or slug already exists
    const { data, error } = await supabase
      .from("tenants")
      .select("id")
      .or(`name.eq.${tenantName},slug.eq.${slug}`)
      .maybeSingle();

    if (error) throw error;

    // If no tenant found, the name is available
    return !data;
  } catch (error) {
    console.error("Error checking tenant name availability:", error);
    return false;
  }
}
