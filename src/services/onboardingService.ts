
import { supabase } from '@/lib/supabase';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Validates a company name
 * @param name Company name to validate
 * @returns True if valid
 */
export function validateCompanyName(name: string): boolean {
  return name.length >= 2 && name.length <= 100;
}

/**
 * Creates a company profile
 * @param tenantId Tenant ID
 * @param companyName Company name
 * @param industry Industry
 * @param size Company size
 * @param goals Company goals
 * @param userId User ID of the creator
 * @returns Result of the operation
 */
export async function createCompanyProfile(
  tenantId: string,
  companyName: string,
  industry: string,
  size: string,
  goals: string[],
  userId: string
) {
  try {
    const { data, error } = await supabase
      .from('company_profiles')
      .insert({
        tenant_id: tenantId,
        name: companyName,
        industry,
        size,
        goals,
        created_by: userId
      })
      .select()
      .single();

    if (error) throw error;
    
    // Log the successful profile creation
    await logSystemEvent('tenant', 'created', {
      event_type: 'company_profile_created',
      tenant_id: tenantId,
      company_name: companyName
    }, tenantId);
    
    return { success: true, data };
  } catch (err: any) {
    console.error('Error creating company profile:', err);
    return { success: false, error: err.message || 'Failed to create company profile' };
  }
}

/**
 * Creates a persona profile
 * @param tenantId Tenant ID
 * @param targetAudience Target audience
 * @param audienceNeeds Audience needs
 * @param businessModel Business model
 * @param tonePreference Tone preference
 * @param userId User ID of the creator
 * @returns Result of the operation
 */
export async function createPersonaProfile(
  tenantId: string,
  targetAudience: string[],
  audienceNeeds: string[],
  businessModel: string,
  tonePreference: string,
  userId: string
) {
  try {
    const { data, error } = await supabase
      .from('persona_profiles')
      .insert({
        tenant_id: tenantId,
        target_audience: targetAudience,
        audience_needs: audienceNeeds,
        business_model: businessModel,
        tone_preference: tonePreference,
        created_by: userId
      })
      .select()
      .single();

    if (error) throw error;
    
    // Log the successful persona creation
    await logSystemEvent('tenant', 'created', {
      event_type: 'persona_profile_created',
      tenant_id: tenantId
    }, tenantId);
    
    return { success: true, data };
  } catch (err: any) {
    console.error('Error creating persona profile:', err);
    return { success: false, error: err.message || 'Failed to create persona profile' };
  }
}

/**
 * Completes the onboarding process
 * @param tenantId Tenant ID
 * @param userId User ID
 * @returns Result of the operation
 */
export async function completeOnboarding(tenantId: string, userId: string) {
  try {
    // Update the tenant record to mark onboarding as completed
    const { error: tenantError } = await supabase
      .from('tenants')
      .update({ 
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      })
      .eq('id', tenantId);

    if (tenantError) throw tenantError;
    
    // Update the user profile to mark onboarding as completed
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', userId);
      
    if (profileError) throw profileError;
    
    // Log the onboarding completion
    await logSystemEvent('tenant', 'info', {
      event_type: 'onboarding_completed',
      tenant_id: tenantId,
      user_id: userId
    }, tenantId);
    
    return { success: true };
  } catch (err: any) {
    console.error('Error completing onboarding:', err);
    return { success: false, error: err.message || 'Failed to complete onboarding' };
  }
}
