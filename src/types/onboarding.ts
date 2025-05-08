
// Onboarding step identifier
export type OnboardingStep = 'company-info' | 'persona' | 'additional-info' | 'strategy-generation';

// Form data structure for the onboarding process
export interface OnboardingFormData {
  companyName: string;
  industry: string;
  companySize: string;
  revenueRange: string;
  website: string;
  description: string;
  goals: string[];
  additionalInfo: string;
  persona: {
    name: string;
    goals: string[];
    tone: string;
  };
  [key: string]: any; // Allow for dynamic keys during validation
}

// Onboarding state management
export interface OnboardingState {
  currentStep: number;
  formData: OnboardingFormData;
  isComplete: boolean;
  tenantId?: string;
  isSubmitting: boolean;
}

// Actions for the onboarding state
export interface OnboardingAction {
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

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}
