import { supabase } from '@/lib/supabase';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Create a new company profile during onboarding
 * @param data Company profile data
 * @param tenantId Tenant ID
 * @param userId User ID
 * @returns Promise with the created company profile
 */
export async function createCompanyProfile(
  data: Record<string, any>,
  tenantId: string,
  userId: string
) {
  try {
    // Validate required fields
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    if (!data?.companyName) {
      throw new Error('Company name is required');
    }
    
    // Create the company profile
    const { data: company, error } = await supabase
      .from('company_profiles')
      .insert({
        tenant_id: tenantId,
        name: data.companyName,
        industry: data.industry || null,
        size: data.companySize || null,
        website: data.website || null,
        description: data.description || null,
        goals: data.goals || [],
        created_by: userId
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Log the event
    await logSystemEvent(
      'onboarding',
      'company_profile_created',
      {
        company_id: company.id,
        tenant_id: tenantId,
      },
      tenantId
    );
    
    return company;
    
  } catch (err: any) {
    console.error('Error creating company profile:', err);
    // Log the error event
    await logSystemEvent(
      'onboarding',
      'error',
      {
        message: 'Failed to create company profile',
        error: err.message,
        tenant_id: tenantId
      },
      tenantId
    );
    
    throw err;
  }
}

/**
 * Create a new user persona during onboarding
 * @param data User persona data
 * @param tenantId Tenant ID
 * @param userId User ID
 * @returns Promise with the created user persona
 */
export async function createUserPersona(
  data: Record<string, any>,
  tenantId: string,
  userId: string
) {
  try {
    // Validate required fields
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    if (!data?.persona) {
      throw new Error('Persona is required');
    }
    
    // Create the user persona
    const { data: persona, error } = await supabase
      .from('user_personas')
      .insert({
        tenant_id: tenantId,
        persona: data.persona,
        tone_preference: data.tonePreference || null,
        targeting: data.targeting || [],
        aggressiveness: data.aggressiveness || 'moderate',
        created_by: userId
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Log the event
    await logSystemEvent(
      'onboarding',
      'user_persona_created',
      {
        persona_id: persona.id,
        tenant_id: tenantId,
      },
      tenantId
    );
    
    return persona;
    
  } catch (err: any) {
    console.error('Error creating user persona:', err);
    // Log the error event
    await logSystemEvent(
      'onboarding',
      'error',
      {
        message: 'Failed to create user persona',
        error: err.message,
        tenant_id: tenantId
      },
      tenantId
    );
    
    throw err;
  }
}

/**
 * Complete the onboarding process
 * @param tenantId Tenant ID
 * @param userId User ID
 * @returns Promise with success status
 */
export async function completeOnboarding(
  tenantId: string,
  userId: string
): Promise<boolean> {
  try {
    // Validate required fields
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    // Mark onboarding as complete
    const { error } = await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', userId);
    
    if (error) {
      throw error;
    }
    
    // Log the event
    await logSystemEvent(
      'onboarding',
      'onboarding_completed',
      {
        tenant_id: tenantId,
        user_id: userId,
      },
      tenantId
    );
    
    return true;
    
  } catch (err: any) {
    console.error('Error completing onboarding:', err);
    // Log the error event
    await logSystemEvent(
      'onboarding',
      'error',
      {
        message: 'Failed to complete onboarding',
        error: err.message,
        tenant_id: tenantId
      },
      tenantId
    );
    
    return false;
  }
}
