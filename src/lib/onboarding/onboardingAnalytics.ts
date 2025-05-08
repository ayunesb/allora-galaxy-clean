
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { OnboardingStep } from '@/types/onboarding';

/**
 * Track when a user views an onboarding step
 */
export const trackOnboardingStepView = async (
  userId: string,
  stepId: OnboardingStep
) => {
  try {
    await logSystemEvent('system', 'onboarding', 'view_step', {
      user_id: userId,
      step_id: stepId,
    });
  } catch (error) {
    // Non-critical tracking, just log the error
    console.error('Failed to track onboarding step view:', error);
  }
};

/**
 * Track when a user completes an onboarding step
 */
export const trackOnboardingStepCompleted = async (
  userId: string,
  stepId: OnboardingStep
) => {
  try {
    await logSystemEvent('system', 'onboarding', 'complete_step', {
      user_id: userId,
      step_id: stepId,
    });
  } catch (error) {
    // Non-critical tracking, just log the error
    console.error('Failed to track onboarding step completion:', error);
  }
};
