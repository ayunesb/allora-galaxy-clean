
/**
 * Defines the steps in the onboarding process
 */
export type OnboardingStep = 'company-info' | 'persona' | 'additional-info' | 'strategy-generation';

/**
 * Persona information for onboarding
 */
export interface PersonaInfo {
  name: string;
  goals: string[];
  tone: string;
}

/**
 * Data collected during the onboarding process
 */
export interface OnboardingFormData {
  companyName: string;
  industry: string;
  companySize: string;
  website?: string;
  revenueRange: string;
  goals: string[];
  persona: PersonaInfo;
  additionalInfo?: string;
}

/**
 * Result of validating onboarding data
 */
export interface OnboardingValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Result of generating a strategy during onboarding
 */
export interface StrategyGenerationResult {
  success: boolean;
  tenantId?: string;
  error?: string;
  strategyId?: string;
}
