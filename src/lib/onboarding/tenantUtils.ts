
import { supabase } from "@/integrations/supabase/client";
import { logSystemEvent } from "@/lib/system/logSystemEvent";
import { OnboardingFormData } from "@/types/onboarding";

/**
 * Check if user already has existing tenants
 */
export async function checkExistingTenants(userId: string) {
  try {
    const { data, error } = await supabase
      .from('tenant_user_roles')
      .select('tenant_id, role, tenants:tenant_id(id, name, slug)')
      .eq('user_id', userId);

    if (error) {
      console.error('Error checking tenants:', error);
      throw error;
    }

    return data?.map(item => ({
      id: item.tenant_id,
      name: item.tenants?.name || 'Unknown Tenant',
      slug: item.tenants?.slug,
      role: item.role
    })) || [];
  } catch (error) {
    console.error('Error checking tenants:', error);
    return [];
  }
}

/**
 * Creates a new tenant from onboarding form data
 */
export async function createTenantFromOnboarding(
  userId: string, 
  data: OnboardingFormData
): Promise<{ success: boolean; tenantId?: string; error?: string }> {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    // Generate a unique slug from company name
    const slug = createSlug(data.companyName);

    // 1. Create the tenant
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: data.companyName,
        slug,
        owner_id: userId,
        metadata: {
          industry: data.industry,
          size: data.companySize,
          revenueRange: data.revenueRange,
          website: data.website || '',
          onboarding_completed: true
        }
      })
      .select('id')
      .single();

    if (tenantError) {
      await logSystemEvent(
        'system',
        'onboarding',
        'tenant_creation_failed',
        { error: tenantError.message, user_id: userId }
      );
      return { success: false, error: `Tenant creation failed: ${tenantError.message}` };
    }

    const tenantId = tenantData.id;

    // 2. Add user as owner
    const { error: roleError } = await supabase
      .from('tenant_user_roles')
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        role: 'owner'
      });

    if (roleError) {
      await logSystemEvent(
        tenantId,
        'onboarding',
        'tenant_role_creation_failed',
        { error: roleError.message, user_id: userId }
      );
      return { success: false, error: `Role assignment failed: ${roleError.message}` };
    }

    // 3. Add company profile
    const { error: companyError } = await supabase
      .from('company_profiles')
      .insert({
        tenant_id: tenantId,
        name: data.companyName,
        description: data.description,
        industry: data.industry,
        size: data.companySize,
        revenue_range: data.revenueRange,
        website: data.website || ''
      });

    if (companyError) {
      await logSystemEvent(
        tenantId,
        'onboarding',
        'company_profile_creation_failed',
        { error: companyError.message }
      );
      return { success: false, error: `Company profile creation failed: ${companyError.message}` };
    }

    // 4. Add persona profile
    if (data.persona) {
      const { error: personaError } = await supabase
        .from('persona_profiles')
        .insert({
          tenant_id: tenantId,
          name: data.persona.name,
          goals: data.persona.goals,
          tone: data.persona.tone
        });

      if (personaError) {
        await logSystemEvent(
          tenantId,
          'onboarding',
          'persona_profile_creation_failed',
          { error: personaError.message }
        );
        return { success: false, error: `Persona profile creation failed: ${personaError.message}` };
      }
    }

    // 5. Update user profile to mark onboarding as completed
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', userId);

    if (profileError) {
      console.warn('Failed to update profile onboarding status:', profileError);
      // Non-critical error, continue
    }

    // Log successful tenant creation
    await logSystemEvent(
      tenantId,
      'onboarding',
      'tenant_created',
      {
        user_id: userId,
        company_name: data.companyName,
        industry: data.industry
      }
    );

    return { success: true, tenantId };
  } catch (error: any) {
    console.error('Error creating tenant:', error);
    await logSystemEvent(
      'system',
      'onboarding',
      'tenant_creation_error',
      { error: error.message }
    );
    return { success: false, error: error.message };
  }
}

/**
 * Create a URL-friendly slug from a name
 */
function createSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${randomSuffix}`;
}
