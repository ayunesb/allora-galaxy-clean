
/**
 * Core onboarding types for Allora OS
 */

export type OnboardingStep = 'welcome' | 'company-info' | 'persona' | 'additional-info' | 'strategy-generation' | 'completed';

/**
 * Persona profile definition used in onboarding
 */
export interface PersonaProfile {
  name: string;
  goals: string[];
  tone: string;
}

/**
 * Main form data structure for the onboarding process
 */
export interface OnboardingFormData {
  companyName: string;
  industry: string;
  companySize: string;
  website?: string;
  revenueRange?: string;
  description?: string;
  goals: string[];
  companyInfo: {
    name: string;
    industry: string;
    size: string;
    [key: string]: any;
  };
  persona: PersonaProfile;
  additionalInfo: {
    targetAudience: string;
    keyCompetitors: string;
    uniqueSellingPoints: string;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * State management for onboarding
 */
export interface OnboardingState {
  step: OnboardingStep;
  formData: OnboardingFormData;
  isLoading: boolean;
  error: string | null;
  currentStep?: number;
  isSubmitting?: boolean;
  tenantId?: string;
  isComplete?: boolean;
}

/**
 * Actions for onboarding store
 */
export interface OnboardingStoreActions {
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  setField: (key: string, value: any) => void;
  reset: () => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setComplete: (isComplete: boolean, tenantId?: string) => void;
  validateStep: (step: OnboardingStep) => boolean;
}

/**
 * Combined type for the onboarding store
 */
export type OnboardingStore = OnboardingState & OnboardingStoreActions;

/**
 * Form validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}
