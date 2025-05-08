
import { safeLogSystemEvent } from '@/lib/system/logSystemEvent';
import { OnboardingStep } from '@/types/onboarding';

/**
 * Track when a user views an onboarding step
 */
export async function trackOnboardingStepView(userId: string, stepId: OnboardingStep) {
  safeLogSystemEvent('onboarding', 'view_step', {
    user_id: userId,
    step_id: stepId
  });
}

/**
 * Track when a user completes an onboarding step
 */
export async function trackOnboardingStepCompleted(userId: string, stepId: OnboardingStep) {
  safeLogSystemEvent('onboarding', 'complete_step', {
    user_id: userId,
    step_id: stepId
  });
}

/**
 * Track when a user starts onboarding
 */
export async function trackOnboardingStarted(userId: string) {
  safeLogSystemEvent('onboarding', 'started', {
    user_id: userId
  });
}

/**
 * Track when a user completes the entire onboarding process
 */
export async function trackOnboardingCompleted(userId: string, tenantId: string) {
  safeLogSystemEvent('onboarding', 'completed', {
    user_id: userId,
    tenant_id: tenantId
  });
}
