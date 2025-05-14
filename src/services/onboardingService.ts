
import { supabase } from '@/lib/supabase';
import { OnboardingFormData } from '@/types/onboarding/types';

/**
 * Complete the onboarding process for a user
 * @param userId The user ID
 * @param formData The onboarding form data
 * @returns Result of the operation
 */
export async function completeOnboarding(userId: string, formData: OnboardingFormData) {
  try {
    // Step 1: Create tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert([{ 
        name: formData.companyName,
        slug: formData.companyName.toLowerCase().replace(/\s+/g, '-'),
        owner_id: userId,
        metadata: {
          industry: formData.industry,
          description: formData.companyDescription
        }
      }])
      .select()
      .single();

    if (tenantError) throw tenantError;

    // Step 2: Add user as owner
    const { error: roleError } = await supabase
      .from('tenant_user_roles')
      .insert([{ 
        tenant_id: tenant.id,
        user_id: userId,
        role: 'owner'
      }]);

    if (roleError) throw roleError;

    // Step 3: Create company profile
    const { error: companyError } = await supabase
      .from('company_profiles')
      .insert([{
        tenant_id: tenant.id,
        name: formData.companyName,
        industry: formData.industry,
        description: formData.companyDescription
      }]);

    if (companyError) throw companyError;

    // Step 4: Create persona profile
    const { error: personaError } = await supabase
      .from('persona_profiles')
      .insert([{
        tenant_id: tenant.id,
        name: formData.personaName || 'Default Persona',
        goals: formData.goals || [],
        tone: formData.tone || 'professional'
      }]);

    if (personaError) throw personaError;

    // Step 5: Create initial strategy
    const { data: strategy, error: strategyError } = await supabase
      .from('strategies')
      .insert([{
        tenant_id: tenant.id,
        title: `Initial Strategy for ${formData.companyName}`,
        description: `Automatically generated strategy based on onboarding data`,
        status: 'approved',
        created_by: userId,
        approved_by: userId,
        tags: ['initial', 'onboarding'],
        priority: 'high'
      }])
      .select()
      .single();

    if (strategyError) throw strategyError;

    // Step 6: Update user profile to mark onboarding as completed
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', userId);

    if (profileError) throw profileError;

    return {
      success: true,
      tenantId: tenant.id,
      strategyId: strategy.id
    };
  } catch (error: any) {
    console.error('Onboarding completion error:', error);
    return { 
      success: false,
      error: error.message || 'Failed to complete onboarding'
    };
  }
}
