
/**
 * Onboarding form data interface
 * Used throughout the onboarding flow to collect and validate user input
 */
export interface OnboardingFormData {
  // Company profile data
  companyName: string;
  industry: string;
  teamSize: string;
  revenueRange: string;
  website: string;
  description: string;

  // Persona profile data
  personaName: string;
  tone: string;
  goals: string;
}

/**
 * Step validation result interface
 */
export interface StepValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Onboarding submission result interface
 */
export interface OnboardingSubmissionResult {
  success: boolean;
  tenantId?: string;
  error?: string;
}
