// Onboarding step type
export type OnboardingStep =
  | "welcome"
  | "company-info"
  | "persona"
  | "additional-info"
  | "strategy-generation"
  | "completed";

// Define persona type
export interface PersonaProfile {
  name: string;
  goals: string[];
  tone: string;
}

// Define the form data type for onboarding
export interface OnboardingFormData {
  companyName?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  revenueRange?: string;
  description?: string;
  goals?: string[];
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

// Define onboarding state
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

// Define store actions
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

// Combined type for the store
export type OnboardingStore = OnboardingState & OnboardingStoreActions;

// Legacy action type - for compatibility
export type OnboardingAction =
  | { type: "SET_STEP"; payload: OnboardingStep }
  | { type: "UPDATE_DATA"; payload: Partial<OnboardingFormData> }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET" };

// Define validation result
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}
