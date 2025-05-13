
export type OnboardingStep = 'welcome' | 'company-info' | 'persona' | 'additional-info' | 'strategy-generation' | 'completed';

export interface PersonaProfile {
  name: string;
  goals: string[];
  tone: string;
}

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

// Added OnboardingData interface for backward compatibility
export interface OnboardingData {
  companyName: string;
  industry: string;
  companySize: string;
  goals: string[];
  persona: string;
  tonePreference: string;
  targeting: string[];
  aggressiveness: 'low' | 'moderate' | 'high';
  [key: string]: any;
}

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

export type OnboardingStore = OnboardingState & OnboardingStoreActions;

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}
