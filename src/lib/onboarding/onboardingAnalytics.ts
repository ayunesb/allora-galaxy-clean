
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Track when a user views an onboarding step
 * @param userId User ID
 * @param stepId Step ID
 * @param additionalData Additional data to log
 */
export function trackOnboardingStepView(
  userId: string,
  stepId: string,
  additionalData: Record<string, any> = {}
): Promise<any> {
  return logSystemEvent('onboarding', 'info', {
    event_type: 'step_view',
    user_id: userId,
    step_id: stepId,
    ...additionalData,
  });
}

/**
 * Track when a user completes an onboarding step
 * @param userId User ID
 * @param stepId Step ID
 * @param additionalData Additional data to log
 */
export function trackOnboardingStepCompleted(
  userId: string,
  stepId: string,
  additionalData: Record<string, any> = {}
): Promise<any> {
  return logSystemEvent('onboarding', 'info', {
    event_type: 'step_completed',
    user_id: userId,
    step_id: stepId,
    ...additionalData,
  });
}

/**
 * Track when onboarding is complete
 * @param userId User ID
 * @param tenantId Tenant ID
 * @param additionalData Additional data to log
 */
export function trackOnboardingComplete(
  userId: string,
  tenantId: string,
  additionalData: Record<string, any> = {}
): Promise<any> {
  return logSystemEvent('onboarding', 'info', {
    event_type: 'onboarding_completed',
    user_id: userId,
    tenant_id: tenantId,
    ...additionalData,
  });
}

/**
 * Track onboarding errors
 * @param userId User ID
 * @param errorMessage Error message
 * @param additionalData Additional data to log
 */
export function trackOnboardingError(
  userId: string,
  errorMessage: string,
  additionalData: Record<string, any> = {}
): Promise<any> {
  return logSystemEvent('onboarding', 'error', {
    event_type: 'onboarding_error',
    user_id: userId,
    error: errorMessage,
    ...additionalData,
  });
}
