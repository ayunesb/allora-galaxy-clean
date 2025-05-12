
import { supabase } from '@/lib/supabase';
import { OnboardingFormData } from '@/types/onboarding';

interface OnboardingResponse {
  success: boolean;
  error?: string;
  tenantId?: string;
  strategyId?: string;
}

/**
 * Generate a URL-friendly slug from a company name
 * @param companyName Company name to slugify
 */
const generateSlug = (companyName: string): string => {
  return companyName
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

/**
 * Create a new tenant for the user
 * @param userId User ID
 * @param companyName Company name
 */
const createTenant = async (userId: string, companyName: string) => {
  const slug = generateSlug(companyName);
  
  const { data, error } = await supabase
    .from('tenants')
    .insert([{
      name: companyName,
      slug,
      owner_id: userId
    }])
    .select()
    .single();
  
  if (error) throw error;
  
  return data;
};

/**
 * Assign the user as an owner of the tenant
 * @param userId User ID
 * @param tenantId Tenant ID
 */
const assignUserToTenant = async (userId: string, tenantId: string) => {
  const { error } = await supabase
    .from('tenant_user_roles')
    .insert([{
      tenant_id: tenantId,
      user_id: userId,
      role: 'owner'
    }]);
  
  if (error) throw error;
};

/**
 * Create a company profile
 * @param tenantId Tenant ID
 * @param formData Onboarding form data
 */
const createCompanyProfile = async (tenantId: string, formData: OnboardingFormData) => {
  const companyData = {
    tenant_id: tenantId,
    name: formData.companyName || formData.companyInfo?.name || 'Untitled Company',
    industry: formData.industry || formData.companyInfo?.industry,
    size: formData.companySize || formData.companyInfo?.size,
    website: formData.website,
    revenue_range: formData.revenueRange,
    description: formData.description
  };
  
  const { data, error } = await supabase
    .from('company_profiles')
    .insert([companyData])
    .select();
  
  if (error) throw error;
  
  return data[0];
};

/**
 * Create a persona profile
 * @param tenantId Tenant ID
 * @param formData Onboarding form data
 */
const createPersonaProfile = async (tenantId: string, formData: OnboardingFormData) => {
  if (!formData.persona) return null;
  
  const { data, error } = await supabase
    .from('persona_profiles')
    .insert([{
      tenant_id: tenantId,
      name: formData.persona.name,
      goals: formData.persona.goals,
      tone: formData.persona.tone
    }])
    .select();
  
  if (error) throw error;
  
  return data[0];
};

/**
 * Update user profile to mark onboarding as completed
 * @param userId User ID
 */
const markOnboardingCompleted = async (userId: string) => {
  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('id', userId);
  
  if (error) throw error;
};

/**
 * Create an initial strategy based on onboarding data
 */
const generateStrategy = async (tenantId: string, userId: string, formData: OnboardingFormData) => {
  const companyName = formData.companyName || formData.companyInfo?.name || 'Your Company';
  
  const { data, error } = await supabase
    .from('strategies')
    .insert([{
      title: `${companyName} Growth Strategy`,
      description: `Initial growth strategy for ${companyName} based on onboarding information.`,
      status: 'draft',
      tenant_id: tenantId,
      created_by: userId,
      tags: formData.goals || ['growth', 'marketing']
    }])
    .select();
  
  if (error) throw error;
  
  return data[0];
};

/**
 * Complete the onboarding process
 * @param userId User ID
 * @param formData Onboarding form data
 */
export const completeOnboarding = async (userId: string, formData: OnboardingFormData): Promise<OnboardingResponse> => {
  try {
    // Get company name from either direct property or nested object
    const companyName = formData.companyName || formData.companyInfo?.name || '';
    
    if (!companyName) {
      return { success: false, error: 'Company name is required' };
    }
    
    // Create a new tenant
    const tenant = await createTenant(userId, companyName);
    
    // Assign the user as an owner
    await assignUserToTenant(userId, tenant.id);
    
    // Create company profile
    await createCompanyProfile(tenant.id, formData);
    
    // Create persona profile if available
    if (formData.persona) {
      await createPersonaProfile(tenant.id, formData);
    }
    
    // Mark onboarding as completed in user profile
    await markOnboardingCompleted(userId);
    
    // Generate an initial strategy
    const strategy = await generateStrategy(tenant.id, userId, formData);
    
    return { 
      success: true,
      tenantId: tenant.id,
      strategyId: strategy.id
    };
    
  } catch (error: any) {
    console.error('Onboarding error:', error);
    return { 
      success: false,
      error: error.message || 'Failed to complete onboarding'
    };
  }
};
