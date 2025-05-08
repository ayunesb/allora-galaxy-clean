
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Track onboarding step view
 */
export async function trackOnboardingStepView(
  userId: string,
  stepId: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    await logSystemEvent(
      'system',
      'onboarding',
      'step_view',
      {
        user_id: userId,
        step_id: stepId,
        ...metadata
      }
    );
  } catch (error) {
    console.error('Failed to track onboarding step view:', error);
    // Non-blocking error - don't throw
  }
}

/**
 * Track onboarding step completion
 */
export async function trackOnboardingStepCompleted(
  userId: string,
  stepId: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    await logSystemEvent(
      'system',
      'onboarding',
      'step_completed',
      {
        user_id: userId,
        step_id: stepId,
        ...metadata
      }
    );
  } catch (error) {
    console.error('Failed to track onboarding step completion:', error);
    // Non-blocking error - don't throw
  }
}

/**
 * Track onboarding completion
 */
export async function trackOnboardingCompleted(
  userId: string,
  tenantId: string,
  formData: Record<string, any> = {}
): Promise<void> {
  try {
    // Update user profile to mark onboarding as completed
    await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', userId);
      
    // Log onboarding completion event  
    await logSystemEvent(
      tenantId,
      'onboarding',
      'completed',
      {
        user_id: userId,
        tenant_id: tenantId,
        company_name: formData.companyName,
        industry: formData.industry
      }
    );
  } catch (error) {
    console.error('Failed to track onboarding completion:', error);
    // Non-blocking error - don't throw
  }
}

/**
 * Track onboarding abandonment
 */
export async function trackOnboardingAbandoned(
  userId: string,
  stepId: string,
  reason?: string
): Promise<void> {
  try {
    await logSystemEvent(
      'system',
      'onboarding',
      'abandoned',
      {
        user_id: userId,
        step_id: stepId,
        reason: reason || 'Unknown'
      }
    );
  } catch (error) {
    console.error('Failed to track onboarding abandonment:', error);
    // Non-blocking error - don't throw
  }
}
