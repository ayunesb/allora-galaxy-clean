
export type OnboardingStep = 'company-info' | 'persona' | 'additional-info' | 'strategy-generation';

export interface PersonaData {
  name: string;
  goals: string[];
  tone: string;
}

export interface OnboardingFormData {
  companyName: string;
  industry: string;
  companySize: string;
  goals: string[];
  persona: PersonaData;
  additionalInfo?: string;
  website?: string;
  revenueRange?: string;
  teamSize?: string;
}

export interface OnboardingErrorData {
  companyName?: string;
  industry?: string;
  companySize?: string;
  goals?: string;
  'persona.name'?: string;
  'persona.goals'?: string;
  'persona.tone'?: string;
  additionalInfo?: string;
  website?: string;
  revenueRange?: string;
  teamSize?: string;
}

export interface StepValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export interface CompanyInfoStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  setFieldValue: (key: string, value: any) => void;
}

export interface PersonaStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  setFieldValue: (key: string, value: any) => void;
}

export interface AdditionalInfoStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  setFieldValue: (key: string, value: any) => void;
}

export interface StrategyGenerationStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  isGenerating: boolean;
  setFieldValue: (key: string, value: any) => void;
}
