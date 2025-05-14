
import { OnboardingFormData } from '@/types/onboarding';
import { supabase } from '@/lib/supabase';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { trackOnboardingComplete } from '@/lib/onboarding/onboardingAnalytics';

export interface OnboardingResult {
  success: boolean;
  error?: string;
  tenantId?: string;
  strategyId?: string;
}

/**
 * Complete the onboarding process by creating a new tenant and initial strategy
 */
export const completeOnboarding = async (
  userId: string, 
  formData: OnboardingFormData
): Promise<OnboardingResult> => {
  try {
    // Create a new tenant
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: formData.companyName,
        slug: formatSlug(formData.companyName),
        owner_id: userId,
        metadata: {
          industry: formData.industry,
          size: formData.companySize,
          website: formData.website || null
        }
      })
      .select()
      .single();

    if (tenantError) {
      console.error("Tenant creation error:", tenantError);
      return { success: false, error: tenantError.message };
    }

    const tenantId = tenantData.id;

    // Create user role in the tenant
    const { error: roleError } = await supabase
      .from('tenant_user_roles')
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        role: 'owner'
      });

    if (roleError) {
      console.error("Role creation error:", roleError);
      return { success: false, error: roleError.message };
    }

    // Create company profile
    const { error: profileError } = await supabase
      .from('company_profiles')
      .insert({
        tenant_id: tenantId,
        name: formData.companyName,
        industry: formData.industry,
        size: formData.companySize,
        revenue_range: formData.revenueRange || null,
        website: formData.website || null,
        description: formData.description || null
      });

    if (profileError) {
      console.error("Company profile creation error:", profileError);
      return { success: false, error: profileError.message };
    }

    // Create persona profile if persona data is available
    if (formData.persona) {
      const { error: personaError } = await supabase
        .from('persona_profiles')
        .insert({
          tenant_id: tenantId,
          name: formData.persona.name || 'Target Persona',
          goals: formData.persona.goals || formData.goals || [],
          tone: formData.persona.tone || 'Professional'
        });

      if (personaError) {
        console.error("Persona creation error:", personaError);
        // Non-critical error, continue with onboarding
      }
    }

    // Create initial strategy
    const { data: strategyData, error: strategyError } = await supabase
      .from('strategies')
      .insert({
        tenant_id: tenantId,
        title: `${formData.companyName} Growth Strategy`,
        description: `Initial growth strategy for ${formData.companyName}`,
        status: 'draft',
        created_by: userId,
        priority: 'high',
        tags: formData.goals || []
      })
      .select()
      .single();

    if (strategyError) {
      console.error("Strategy creation error:", strategyError);
      // Non-critical error, continue with tenant creation success
    }

    // Update user profile to mark onboarding as complete
    await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', userId);

    // Log onboarding completion
    await logSystemEvent(
      'onboarding',
      'completed',
      {
        user_id: userId,
        tenant_id: tenantId,
        company_name: formData.companyName,
        industry: formData.industry
      },
      tenantId
    );

    // Track analytics
    await trackOnboardingComplete(userId, tenantId, {
      company_size: formData.companySize,
      industry: formData.industry
    });

    return {
      success: true,
      tenantId,
      strategyId: strategyData?.id
    };
  } catch (error: any) {
    console.error("Onboarding completion error:", error);
    return {
      success: false,
      error: error.message || "Failed to complete onboarding"
    };
  }
};

/**
 * Format a string into a URL-friendly slug
 */
const formatSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
