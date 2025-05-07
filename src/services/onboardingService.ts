
import { supabase } from '@/integrations/supabase/client';
import { OnboardingFormData, OnboardingSubmissionResult } from '@/types/onboarding';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { validateOnboardingData, generateSlug } from '@/lib/onboarding/validateOnboardingData';

/**
 * Creates tenant, user role, company profile and persona profile
 * @param formData Validated onboarding form data
 * @param userId Current user ID
 */
export const submitOnboardingData = async (
  formData: OnboardingFormData, 
  userId: string
): Promise<OnboardingSubmissionResult> => {
  try {
    // Validate all form data before submission
    const { isValid, errors } = validateOnboardingData(formData);
    if (!isValid) {
      const errorMessages = Object.values(errors).join(", ");
      throw new Error(`Validation failed: ${errorMessages}`);
    }

    // Generate slug from company name
    const slug = generateSlug(formData.companyName);
    
    // Create new tenant
    const { data: newTenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: formData.companyName,
        slug,
        owner_id: userId,
        metadata: {
          industry: formData.industry,
          size: formData.teamSize,
          revenue_range: formData.revenueRange
        }
      })
      .select()
      .single();

    if (tenantError) throw tenantError;
    if (!newTenant) throw new Error("Failed to create tenant: No data returned");

    // Create tenant user role with owner permission
    const { error: roleError } = await supabase
      .from('tenant_user_roles')
      .insert({
        tenant_id: newTenant.id,
        user_id: userId,
        role: 'owner'
      });

    if (roleError) throw roleError;

    // Create company profile
    const { error: companyError } = await supabase
      .from('company_profiles')
      .insert({
        tenant_id: newTenant.id,
        name: formData.companyName,
        industry: formData.industry,
        size: formData.teamSize,
        revenue_range: formData.revenueRange,
        website: formData.website,
        description: formData.description,
      });

    if (companyError) throw companyError;

    // Create persona profile
    const { error: personaError } = await supabase
      .from('persona_profiles')
      .insert({
        tenant_id: newTenant.id,
        name: formData.personaName,
        tone: formData.tone,
        goals: formData.goals.split('\n').filter(goal => goal.trim() !== ''),
      });

    if (personaError) throw personaError;

    // Log successful onboarding
    await logSystemEvent(
      newTenant.id,
      'onboarding',
      'onboarding_complete',
      {
        user_id: userId,
        company_name: formData.companyName,
        industry: formData.industry
      }
    );

    return {
      success: true,
      tenantId: newTenant.id
    };
  } catch (error: any) {
    console.error('Onboarding error:', error);
    
    try {
      await logSystemEvent(
        'system',
        'onboarding',
        'onboarding_failed',
        {
          user_id: userId,
          error: error.message
        }
      );
    } catch (logError) {
      console.error("Failed to log onboarding error:", logError);
    }
    
    return {
      success: false,
      error: error.message || 'An unexpected error occurred during onboarding'
    };
  }
};
