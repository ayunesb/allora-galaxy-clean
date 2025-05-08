
import { supabase } from '@/integrations/supabase/client';
import { OnboardingFormData, GenerateStrategyParams, GenerateStrategyResult } from '@/types/onboarding';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { createTenantFromOnboarding } from '@/lib/onboarding/tenantUtils';

/**
 * Generates initial strategies based on onboarding data
 */
export async function generateInitialStrategy(
  userId: string,
  tenantId: string,
  formData: OnboardingFormData
): Promise<{ success: boolean; strategyId?: string; error?: string }> {
  try {
    // Create initial strategy
    const strategyTitle = `${formData.companyName} Initial Strategy`;
    const strategyDescription = `Auto-generated strategy for ${formData.companyName} targeting ${formData.persona.name}`;
    
    // Process goals
    const goals = Array.isArray(formData.goals) 
      ? formData.goals 
      : formData.goals.split(',').map(g => g.trim());
    
    // Create tags
    const tags = ['initial', 'onboarding'];
    if (formData.industry) {
      tags.push(formData.industry.toLowerCase());
    }

    // Insert the strategy
    const { data: strategyData, error: strategyError } = await supabase
      .from('strategies')
      .insert({
        tenant_id: tenantId,
        title: strategyTitle,
        description: strategyDescription,
        status: 'pending',
        created_by: userId,
        priority: 'high',
        tags,
        completion_percentage: 0
      })
      .select('id')
      .single();

    if (strategyError) {
      console.error('Error creating strategy:', strategyError);
      await logSystemEvent(
        tenantId,
        'onboarding', 
        'initial_strategy_creation_failed',
        { error: strategyError.message }
      );
      return { success: false, error: strategyError.message };
    }

    // Log success
    await logSystemEvent(
      tenantId,
      'onboarding',
      'initial_strategy_created',
      { 
        strategy_id: strategyData.id,
        strategy_title: strategyTitle 
      }
    );

    return { success: true, strategyId: strategyData.id };
  } catch (error: any) {
    console.error('Error generating strategy:', error);
    await logSystemEvent(
      tenantId,
      'onboarding',
      'strategy_generation_error',
      { error: error.message }
    );
    return { success: false, error: error.message };
  }
}

/**
 * Complete onboarding process by creating tenant and initial strategy
 */
export async function completeOnboarding(
  userId: string,
  formData: OnboardingFormData
): Promise<{ success: boolean; tenantId?: string; strategyId?: string; error?: string }> {
  try {
    // Create tenant and related data
    const tenantResult = await createTenantFromOnboarding(userId, formData);
    
    if (!tenantResult.success || !tenantResult.tenantId) {
      return { success: false, error: tenantResult.error || 'Failed to create tenant' };
    }
    
    // Generate initial strategy
    const strategyResult = await generateInitialStrategy(userId, tenantResult.tenantId, formData);
    
    if (!strategyResult.success) {
      return { 
        success: true, 
        tenantId: tenantResult.tenantId, 
        error: `Tenant created but strategy generation failed: ${strategyResult.error}` 
      };
    }
    
    // Return success with both IDs
    return {
      success: true,
      tenantId: tenantResult.tenantId,
      strategyId: strategyResult.strategyId
    };
  } catch (error: any) {
    console.error('Error completing onboarding:', error);
    return { success: false, error: error.message || 'Unknown error during onboarding' };
  }
}
