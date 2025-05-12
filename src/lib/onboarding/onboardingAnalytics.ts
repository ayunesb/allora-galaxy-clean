
import { supabase } from '@/lib/supabase';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { SystemEventModule } from '@/types/shared';

/**
 * Logs an onboarding step completion event
 * @param userId The user ID
 * @param tenantId The tenant ID
 * @param step The onboarding step name
 * @param data Additional data related to the step
 */
export async function logOnboardingStep(
  userId: string,
  tenantId: string,
  step: string,
  data?: Record<string, any>
) {
  try {
    await logSystemEvent(
      'user' as SystemEventModule, // Cast to SystemEventModule to avoid type error
      'onboarding_step_completed',
      {
        step,
        user_id: userId,
        tenant_id: tenantId,
        ...data
      },
      tenantId
    );
  } catch (error) {
    console.error('Failed to log onboarding step:', error);
  }
}

/**
 * Marks the onboarding process as completed for a user
 * @param userId The user ID
 */
export async function markOnboardingCompleted(userId: string) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', userId);
      
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to mark onboarding as completed:', error);
    return { success: false, error };
  }
}

/**
 * Checks if a user has completed onboarding
 * @param userId The user ID
 * @returns Boolean indicating if onboarding is completed
 */
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', userId)
      .single();
      
    if (error) {
      throw error;
    }
    
    return !!data?.onboarding_completed;
  } catch (error) {
    console.error('Failed to check onboarding status:', error);
    return false;
  }
}
