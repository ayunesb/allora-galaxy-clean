
// Define onboarding types
export interface OnboardingFormData {
  companyName: string;
  industry: string;
  teamSize: string;
  revenueRange: string;
  website?: string;
  description?: string;
  personaName: string;
  tone: string;
  goals: string; // Changed from string[] to string to match usage in components
  additionalInfo?: string;
}

export type OnboardingStep = 'company-info' | 'persona' | 'additional-info' | 'strategy-generation';

export interface StepValidationResult {
  valid: boolean;
  errors?: Record<string, string>;
}

export interface StepComponentProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  setFieldValue: (key: string, value: any) => void;
}

export interface CompanyInfoStepProps extends StepComponentProps {}
export interface PersonaStepProps extends StepComponentProps {}
export interface AdditionalInfoStepProps extends StepComponentProps {}
export interface StrategyGenerationStepProps extends StepComponentProps {
  isGenerating?: boolean;
}
