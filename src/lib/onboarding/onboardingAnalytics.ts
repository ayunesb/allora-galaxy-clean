
import { supabase } from '@/lib/supabase';
import { OnboardingStep } from '@/types/onboarding';
import { SystemEventModule } from '@/types/logs';

// Log onboarding event to analytics
export const logOnboardingEvent = async (
  step: OnboardingStep,
  userId: string,
  tenantId?: string,
  details?: Record<string, any>
) => {
  try {
    const event = `onboarding_${step}`;
    const module: SystemEventModule = 'user';
    
    await supabase.from('system_logs').insert([
      {
        module,
        event,
        tenant_id: tenantId,
        context: {
          user_id: userId,
          step,
          ...details
        }
      }
    ]);
  } catch (error) {
    console.error('Failed to log onboarding event:', error);
  }
};

// Track onboarding completion
export const trackOnboardingCompletion = async (
  userId: string,
  tenantId: string,
  timeSpentSeconds: number
) => {
  try {
    await supabase.from('system_logs').insert([
      {
        module: 'user',
        event: 'onboarding_completed',
        tenant_id: tenantId,
        context: {
          user_id: userId,
          time_spent_seconds: timeSpentSeconds,
          completed_at: new Date().toISOString()
        }
      }
    ]);
  } catch (error) {
    console.error('Failed to track onboarding completion:', error);
  }
};
