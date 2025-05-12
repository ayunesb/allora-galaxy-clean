
// Onboarding step type
export type OnboardingStep = 'welcome' | 'company-info' | 'persona' | 'additional-info' | 'strategy-generation' | 'completed';

// Define persona type
export interface PersonaProfile {
  name: string;
  goals: string[];
  tone: string;
}

// Define the form data type for onboarding
export interface OnboardingFormData {
  companyName: string;
  industry: string;
  companySize: string;
  website?: string;
  revenueRange: string;
  description: string;
  goals: string[];
  additionalInfo?: string;
  persona: PersonaProfile;
  [key: string]: any; // Allow additional properties
}

// Define onboarding state
export interface OnboardingState {
  step: OnboardingStep;
  formData: OnboardingFormData;
  isSubmitting: boolean;
  isComplete: boolean;
  tenantId?: string;
  error: string | null;
}

// Define zustand state actions
export interface OnboardingStateActions {
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: OnboardingStep) => void;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  setField: (key: string, value: any) => void;
  reset: () => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setComplete: (isComplete: boolean, tenantId?: string) => void;
  validateStep: (step: OnboardingStep) => boolean;
}

// Combined type for the onboarding store
export type OnboardingStore = OnboardingState & OnboardingStateActions;
