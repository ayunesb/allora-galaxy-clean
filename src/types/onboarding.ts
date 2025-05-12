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
  currentStep: number;
  formData: OnboardingFormData;
  isSubmitting: boolean;
  isComplete: boolean;
  error: string | null;
}

// Define onboarding actions
export type OnboardingAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'UPDATE_FORM'; payload: Partial<OnboardingFormData> }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_COMPLETE'; payload: boolean }
  | { type: 'RESET' };

// Define validation result
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}
