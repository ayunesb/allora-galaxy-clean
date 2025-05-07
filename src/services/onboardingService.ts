
import { supabase } from '@/integrations/supabase/client';
import { OnboardingFormData, OnboardingSubmissionResult } from '@/types/onboarding';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { generateSlug, ensureUniqueSlug } from '@/lib/utils/slugUtils';

/**
 * Validates onboarding form data
 * @param formData The form data to validate
 * @returns Validation result with error messages
 */
export const validateOnboardingData = (formData: OnboardingFormData) => {
  const errors: Record<string, string> = {};
  
  // Company validation
  if (!formData.companyName?.trim()) {
    errors.companyName = 'Company name is required';
  }
  
  if (!formData.industry?.trim()) {
    errors.industry = 'Industry is required';
  }
  
  if (!formData.teamSize?.trim()) {
    errors.teamSize = 'Team size is required';
  }
  
  if (!formData.revenueRange?.trim()) {
    errors.revenueRange = 'Revenue range is required';
  }
  
  // Persona validation
  if (!formData.personaName?.trim()) {
    errors.personaName = 'Persona name is required';
  }
  
  if (!formData.tone?.trim()) {
    errors.tone = 'Tone is required';
  }
  
  if (!formData.goals?.trim()) {
    errors.goals = 'Goals are required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Generates a unique slug for a tenant
 * @param companyName Base name for the slug
 * @returns Promise resolving to a unique slug
 */
export const generateUniqueSlug = async (companyName: string): Promise<string> => {
  // Generate base slug from company name
  const baseSlug = generateSlug(companyName);
  
  // Get existing slugs from DB
  const { data: existingTenants } = await supabase
    .from('tenants')
    .select('slug');
  
  const existingSlugs = existingTenants?.map(tenant => tenant.slug) || [];
  
  // Ensure slug uniqueness
  return ensureUniqueSlug(baseSlug, existingSlugs);
};

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

    // Generate unique slug from company name
    const slug = await generateUniqueSlug(formData.companyName);
    
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
