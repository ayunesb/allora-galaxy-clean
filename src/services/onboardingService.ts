
import { supabase } from '@/integrations/supabase/client';
import { useMutation } from '@tanstack/react-query';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { OnboardingFormData } from '@/types/onboarding';

/**
 * Submit the onboarding data to create a new tenant and related records
 * 
 * @param data The onboarding form data
 * @returns Result object with success status and tenant ID
 */
export async function submitOnboardingData(data: OnboardingFormData) {
  try {
    // Create the company profile
    const { data: companyData, error: companyError } = await supabase
      .from('company_profiles')
      .insert({
        name: data.companyName,
        industry: data.industry,
        description: data.companyDescription
      })
      .select('id')
      .single();

    if (companyError) {
      throw new Error(`Error creating company profile: ${companyError.message}`);
    }

    // Create the tenant
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: data.companyName,
        slug: data.companyName.toLowerCase().replace(/\s+/g, '-'),
        metadata: {
          companyProfileId: companyData.id,
          goals: data.goals
        }
      })
      .select('id')
      .single();

    if (tenantError) {
      throw new Error(`Error creating tenant: ${tenantError.message}`);
    }

    // Create the tenant user role
    const { error: roleError } = await supabase
      .from('tenant_user_roles')
      .insert({
        tenant_id: tenantData.id,
        user_id: data.userId,
        role: 'owner'
      });

    if (roleError) {
      throw new Error(`Error creating tenant user role: ${roleError.message}`);
    }

    // Create persona profile
    const { error: personaError } = await supabase
      .from('persona_profiles')
      .insert({
        tenant_id: tenantData.id,
        name: 'Default Persona',
        goals: data.goals,
        tone: data.tone || 'professional'
      });

    if (personaError) {
      throw new Error(`Error creating persona profile: ${personaError.message}`);
    }

    // Log the successful onboarding
    await logSystemEvent(
      'onboarding',
      'completed',
      {
        tenant_id: tenantData.id,
        company_name: data.companyName
      },
      tenantData.id
    );

    return {
      success: true,
      tenantId: tenantData.id
    };
  } catch (error: any) {
    console.error('Onboarding error:', error);
    // Log the error
    await logSystemEvent(
      'onboarding',
      'error',
      {
        error: error.message,
        data: { companyName: data.companyName }
      }
    );
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate initial strategies for a tenant using AI
 * 
 * @param tenantId The tenant ID
 * @param goals Array of business goals
 * @param industry The company industry
 * @returns Result object with success status
 */
export async function generateInitialStrategies(tenantId: string, goals: string[], industry: string) {
  try {
    // Simulate strategy generation (in a real implementation, this would call an AI service)
    const strategies = goals.map((goal, index) => ({
      title: `Strategy for ${goal}`,
      description: `AI-generated strategy to achieve ${goal} for a business in the ${industry} industry.`,
      status: 'draft',
      priority: index === 0 ? 'high' : 'medium',
      tenant_id: tenantId,
      tags: [industry, goal.toLowerCase().replace(/\s+/g, '-')],
      completion_percentage: 0
    }));

    // Insert the generated strategies
    const { error } = await supabase
      .from('strategies')
      .insert(strategies);

    if (error) {
      throw new Error(`Error creating strategies: ${error.message}`);
    }

    // Log the successful strategy generation
    await logSystemEvent(
      'strategy',
      'generation_complete',
      {
        tenant_id: tenantId,
        strategy_count: strategies.length
      },
      tenantId
    );

    return {
      success: true,
      tenantId: tenantId
    };
  } catch (error: any) {
    console.error('Strategy generation error:', error);
    // Log the error
    await logSystemEvent(
      'strategy',
      'generation_error',
      {
        error: error.message,
        tenant_id: tenantId
      },
      tenantId
    );
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Custom hook for submitting onboarding data with React Query
 */
export function useOnboardingSubmission() {
  return useMutation({
    mutationFn: submitOnboardingData,
  });
}

/**
 * Custom hook for generating initial strategies with React Query
 */
export function useStrategyGeneration() {
  return useMutation({
    mutationFn: ({ tenantId, goals, industry }: { tenantId: string, goals: string[], industry: string }) => 
      generateInitialStrategies(tenantId, goals, industry),
  });
}
