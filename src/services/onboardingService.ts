import { supabase } from '@/integrations/supabase/client';
import { OnboardingFormData } from '@/types/onboarding';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Creates a new tenant from onboarding data
 */
export async function createTenantFromOnboarding(
  userId: string,
  data: OnboardingFormData
): Promise<{ tenantId: string | null; error: string | null }> {
  try {
    // Create new tenant
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: data.companyName,
        slug: data.companyName.toLowerCase().replace(/\s+/g, '-'),
        owner_id: userId,
      })
      .select('id')
      .single();

    if (tenantError) throw tenantError;
    if (!tenantData?.id) throw new Error('Failed to create tenant');

    const tenantId = tenantData.id;

    // Add user as owner
    const { error: roleError } = await supabase
      .from('tenant_user_roles')
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        role: 'owner',
      });

    if (roleError) throw roleError;

    // Create company profile
    const { error: companyError } = await supabase.from('company_profiles').insert({
      tenant_id: tenantId,
      name: data.companyName,
      industry: data.industry,
      size: data.companySize,
      revenue_range: data.revenueRange,
      website: data.website,
      description: data.description,
    });

    if (companyError) throw companyError;

    // Create persona profile
    if (data.persona) {
      const { error: personaError } = await supabase.from('persona_profiles').insert({
        tenant_id: tenantId,
        name: data.persona.name,
        goals: data.persona.goals,
        tone: data.persona.tone,
      });

      if (personaError) throw personaError;
    }

    // Log onboarding completion
    await logSystemEvent(tenantId, 'system', 'onboarding_completed', {
      user_id: userId,
      company_name: data.companyName,
      industry: data.industry,
    });

    return { tenantId, error: null };
  } catch (error: any) {
    console.error('Error creating tenant from onboarding:', error);
    return { tenantId: null, error: error.message || 'Failed to create tenant' };
  }
}

/**
 * Complete the onboarding process
 */
export async function completeOnboarding(
  userId: string, 
  formData: OnboardingFormData
): Promise<{ 
  success: boolean; 
  tenantId?: string; 
  strategyId?: string;
  error?: string; 
}> {
  try {
    // Create tenant from onboarding data
    const { tenantId, error } = await createTenantFromOnboarding(userId, formData);
    
    if (error || !tenantId) {
      throw new Error(error || 'Failed to create tenant');
    }
    
    // Update user profile to mark onboarding as complete
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', userId);
    
    if (profileError) {
      console.warn('Failed to update profile onboarding status:', profileError);
      // Non-critical error, continue with onboarding
    }
    
    // Create initial strategy
    const { data: strategyData, error: strategyError } = await supabase
      .from('strategies')
      .insert({
        title: `Initial ${formData.companyName} Strategy`,
        description: `Auto-generated strategy based on ${formData.industry} industry profile`,
        status: 'draft',
        created_by: userId,
        tenant_id: tenantId,
        tags: [formData.industry, 'auto-generated'],
      })
      .select('id')
      .single();
    
    if (strategyError) {
      console.warn('Failed to create initial strategy:', strategyError);
      // Non-critical error, continue with onboarding
    }
    
    return { 
      success: true, 
      tenantId, 
      strategyId: strategyData?.id 
    };
  } catch (err: any) {
    console.error('Complete onboarding error:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred during onboarding'
    };
  }
}
