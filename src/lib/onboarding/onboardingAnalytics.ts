
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { SystemEventModule } from '@/types/shared';

// Extend SystemEventModule type to include "onboarding"
type ExtendedEventModule = SystemEventModule | "onboarding";

/**
 * Log onboarding start event
 * @param userId The user ID
 * @param tenantId The tenant ID
 */
export async function logOnboardingStarted(userId: string, tenantId?: string) {
  try {
    await logSystemEvent(
      "user" as SystemEventModule, // Use "user" instead of "onboarding"
      "onboarding_started",
      {
        user_id: userId,
        timestamp: new Date().toISOString()
      },
      tenantId
    );
  } catch (error) {
    console.error("Failed to log onboarding start event:", error);
  }
}

/**
 * Log step completion event during onboarding
 * @param userId The user ID
 * @param step The completed step
 * @param tenantId The tenant ID
 */
export async function logStepCompleted(userId: string, step: string, tenantId?: string) {
  try {
    await logSystemEvent(
      "user" as SystemEventModule, // Use "user" instead of "onboarding"
      "onboarding_step_completed",
      {
        user_id: userId,
        step,
        timestamp: new Date().toISOString()
      },
      tenantId
    );
  } catch (error) {
    console.error(`Failed to log step completion for step ${step}:`, error);
  }
}

/**
 * Log onboarding completion event
 * @param userId The user ID
 * @param tenantId The tenant ID
 * @param totalSteps Total number of steps completed
 */
export async function logOnboardingCompleted(userId: string, tenantId?: string, totalSteps?: number) {
  try {
    await logSystemEvent(
      "user" as SystemEventModule, // Use "user" instead of "onboarding"
      "onboarding_completed",
      {
        user_id: userId,
        total_steps: totalSteps,
        timestamp: new Date().toISOString()
      },
      tenantId
    );
  } catch (error) {
    console.error("Failed to log onboarding completion event:", error);
  }
}

/**
 * Log onboarding abandonment event
 * @param userId The user ID
 * @param lastStep The last step before abandonment
 * @param tenantId The tenant ID
 */
export async function logOnboardingAbandoned(userId: string, lastStep: string, tenantId?: string) {
  try {
    await logSystemEvent(
      "user" as SystemEventModule, // Use "user" instead of "onboarding"
      "onboarding_abandoned",
      {
        user_id: userId,
        last_step: lastStep,
        timestamp: new Date().toISOString()
      },
      tenantId
    );
  } catch (error) {
    console.error("Failed to log onboarding abandonment event:", error);
  }
}
