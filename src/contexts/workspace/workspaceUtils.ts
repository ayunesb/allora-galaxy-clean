import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch all tenants that a user has access to
 * @param userId The ID of the user
 * @returns Array of tenant objects
 */
export async function fetchUserTenants(userId: string): Promise<any[]> {
  try {
    // Get tenant IDs from tenant_user_roles
    const { data: tenantUserRoles, error: rolesError } = await supabase
      .from("tenant_user_roles")
      .select("tenant_id, role")
      .eq("user_id", userId);

    if (rolesError) {
      throw rolesError;
    }

    if (!tenantUserRoles || tenantUserRoles.length === 0) {
      return [];
    }

    // Extract tenant IDs
    const tenantIds = tenantUserRoles.map((r) => r.tenant_id);

    // Fetch tenant details
    const { data: tenants, error: tenantsError } = await supabase
      .from("tenants")
      .select("*")
      .in("id", tenantIds);

    if (tenantsError) {
      throw tenantsError;
    }

    // Combine tenant details with roles
    return (
      tenants.map((tenant) => {
        const userRole = tenantUserRoles.find((r) => r.tenant_id === tenant.id);
        return {
          ...tenant,
          userRole: userRole?.role || null,
        };
      }) || []
    );
  } catch (error) {
    console.error("Error fetching user tenants:", error);
    throw error;
  }
}

/**
 * Fetch the role of a user in a specific tenant
 * @param tenantId The ID of the tenant
 * @param userId The ID of the user
 * @returns Role string or null if no role found
 */
export async function fetchUserRole(
  tenantId: string,
  userId: string,
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("tenant_user_roles")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No results found - user has no role in this tenant
        return null;
      }
      throw error;
    }

    return data?.role || null;
  } catch (error) {
    console.error("Error fetching user role:", error);
    throw error;
  }
}

/**
 * Create a new tenant with the user as owner
 * @param name Tenant name
 * @param userId User ID of the creator/owner
 * @param slug Optional URL-friendly slug
 * @returns Created tenant object
 */
export async function createTenant(
  name: string,
  userId: string,
  slug?: string,
): Promise<any> {
  try {
    // Generate slug if not provided
    const tenantSlug = slug || name.toLowerCase().replace(/\s+/g, "-");

    // Create new tenant
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .insert([{ name, slug: tenantSlug, owner_id: userId }])
      .select()
      .single();

    if (tenantError) throw tenantError;

    // Add user as owner
    const { error: roleError } = await supabase
      .from("tenant_user_roles")
      .insert([{ tenant_id: tenant.id, user_id: userId, role: "owner" }]);

    if (roleError) throw roleError;

    return tenant;
  } catch (error) {
    console.error("Error creating tenant:", error);
    throw error;
  }
}

/**
 * Invite a user to a tenant with a specific role
 * @param tenantId Tenant ID
 * @param email Email of the user to invite
 * @param role Role to assign to the user
 * @param invitedBy User ID of the person sending the invitation
 * @returns True if invitation was successful
 */
export async function inviteUserToTenant(
  tenantId: string,
  email: string,
  role: string,
  invitedBy: string,
): Promise<boolean> {
  try {
    // Check if user exists
    const { data: users, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email);

    if (userError) throw userError;

    if (!users || users.length === 0) {
      // User doesn't exist - send invitation email
      // This would typically call an edge function to send email
      await supabase.functions.invoke("send-invite-email", {
        body: { email, tenantId, role, invitedBy },
      });
      return true;
    }

    // User exists - add role directly
    const userId = users[0].id;
    const { error: roleError } = await supabase
      .from("tenant_user_roles")
      .insert([{ tenant_id: tenantId, user_id: userId, role }]);

    if (roleError) throw roleError;

    return true;
  } catch (error) {
    console.error("Error inviting user to tenant:", error);
    throw error;
  }
}

/**
 * Update a user's role in a tenant
 * @param tenantId Tenant ID
 * @param userId User ID
 * @param newRole New role to assign
 * @returns True if update was successful
 */
export async function updateUserRole(
  tenantId: string,
  userId: string,
  newRole: string,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("tenant_user_roles")
      .update({ role: newRole })
      .eq("tenant_id", tenantId)
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
}

/**
 * Remove a user from a tenant
 * @param tenantId Tenant ID
 * @param userId User ID
 * @returns True if removal was successful
 */
export async function removeUserFromTenant(
  tenantId: string,
  userId: string,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("tenant_user_roles")
      .delete()
      .eq("tenant_id", tenantId)
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error removing user from tenant:", error);
    throw error;
  }
}
