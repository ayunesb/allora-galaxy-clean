
import { supabase } from '@/lib/supabase';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { useMutation } from '@tanstack/react-query';

/**
 * Interface for tenant creation data
 */
export interface TenantCreateInput {
  name: string;
  slug: string;
  owner_id: string;
  metadata?: Record<string, any>;
}

/**
 * Interface for company profile creation data
 */
export interface CompanyProfileInput {
  tenant_id: string;
  name: string;
  industry?: string;
  size?: string;
  revenue_range?: string;
  website?: string;
  description?: string;
}

/**
 * Interface for persona profile creation data
 */
export interface PersonaProfileInput {
  tenant_id: string;
  name: string;
  tone?: string;
  goals?: string[];
}

/**
 * Interface for onboarding completion data
 */
export interface OnboardingCompleteInput {
  user_id: string;
}

/**
 * Create a new tenant
 * @param tenant Tenant data
 * @returns Promise resolving to the created tenant ID or null
 */
export async function createTenant(tenant: TenantCreateInput): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .insert(tenant)
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
    
    // Create tenant_user_role entry for owner
    const roleData = {
      tenant_id: data.id,
      user_id: tenant.owner_id,
      role: 'owner'
    };
    
    const { error: roleError } = await supabase
      .from('tenant_user_roles')
      .insert(roleData);
    
    if (roleError) {
      console.error('Error assigning owner role:', roleError);
      throw roleError;
    }
    
    // Log the tenant creation
    await logSystemEvent(
      'onboarding',
      'tenant_created',
      { tenant_id: data.id, name: tenant.name },
      data.id
    );
    
    return data.id;
    
  } catch (err: any) {
    console.error('Error in createTenant:', err);
    // Log the error
    await logSystemEvent(
      'onboarding',
      'error',
      { message: 'Failed to create tenant', error: err.message }
    );
    return null;
  }
}

/**
 * Create a company profile for a tenant
 * @param profile Company profile data
 * @returns Promise resolving to success status
 */
export async function createCompanyProfile(profile: CompanyProfileInput): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('company_profiles')
      .insert(profile);
    
    if (error) {
      console.error('Error creating company profile:', error);
      throw error;
    }
    
    // Log the profile creation
    await logSystemEvent(
      'onboarding',
      'company_profile_created',
      { tenant_id: profile.tenant_id, name: profile.name },
      profile.tenant_id
    );
    
    return true;
    
  } catch (err: any) {
    console.error('Error in createCompanyProfile:', err);
    // Log the error
    await logSystemEvent(
      'onboarding',
      'error',
      { message: 'Failed to create company profile', error: err.message },
      profile.tenant_id
    );
    return false;
  }
}

/**
 * Create a persona profile for a tenant
 * @param profile Persona profile data
 * @returns Promise resolving to success status
 */
export async function createPersonaProfile(profile: PersonaProfileInput): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('persona_profiles')
      .insert(profile);
    
    if (error) {
      console.error('Error creating persona profile:', error);
      throw error;
    }
    
    // Log the profile creation
    await logSystemEvent(
      'onboarding',
      'persona_profile_created',
      { tenant_id: profile.tenant_id, name: profile.name },
      profile.tenant_id
    );
    
    return true;
    
  } catch (err: any) {
    console.error('Error in createPersonaProfile:', err);
    // Log the error
    await logSystemEvent(
      'onboarding',
      'error',
      { message: 'Failed to create persona profile', error: err.message },
      profile.tenant_id
    );
    return false;
  }
}

/**
 * Check if a tenant slug is available
 * @param slug Tenant slug to check
 * @returns Promise resolving to boolean indicating availability
 */
export async function checkSlugAvailability(slug: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking slug availability:', error);
      throw error;
    }
    
    // Slug is available if no tenant with that slug exists
    return data === null;
    
  } catch (err) {
    console.error('Error in checkSlugAvailability:', err);
    // Default to false to prevent potential slug conflicts
    return false;
  }
}

/**
 * Mark onboarding as complete for a user
 * @param data User ID
 * @returns Promise resolving to success status
 */
export async function completeOnboarding(data: OnboardingCompleteInput): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', data.user_id);
    
    if (error) {
      console.error('Error marking onboarding as complete:', error);
      throw error;
    }
    
    // Log the onboarding completion
    await logSystemEvent(
      'onboarding',
      'completed',
      { user_id: data.user_id }
    );
    
    return true;
    
  } catch (err: any) {
    console.error('Error in completeOnboarding:', err);
    // Log the error
    await logSystemEvent(
      'onboarding',
      'error',
      { message: 'Failed to mark onboarding as complete', user_id: data.user_id, error: err.message }
    );
    return false;
  }
}

/**
 * Custom hook to create a tenant with React Query
 * @returns Mutation result object
 */
export function useCreateTenant() {
  return useMutation({
    mutationFn: createTenant
  });
}

/**
 * Custom hook to create a company profile with React Query
 * @returns Mutation result object
 */
export function useCreateCompanyProfile() {
  return useMutation({
    mutationFn: createCompanyProfile
  });
}

/**
 * Custom hook to create a persona profile with React Query
 * @returns Mutation result object
 */
export function useCreatePersonaProfile() {
  return useMutation({
    mutationFn: createPersonaProfile
  });
}

/**
 * Custom hook to check slug availability with React Query
 * @returns Mutation result object
 */
export function useCheckSlugAvailability() {
  return useMutation({
    mutationFn: checkSlugAvailability
  });
}

/**
 * Custom hook to complete onboarding with React Query
 * @returns Mutation result object
 */
export function useCompleteOnboarding() {
  return useMutation({
    mutationFn: completeOnboarding
  });
}
