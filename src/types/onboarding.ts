
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
  data: OnboardingFormData;
  isLoading: boolean;
  error: string | null;
}

// Define onboarding actions
export type OnboardingAction = 
  | { type: 'SET_STEP'; payload: OnboardingStep }
  | { type: 'UPDATE_DATA'; payload: Partial<OnboardingFormData> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

// Define validation result
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}
