
export type OnboardingStep = 'company-info' | 'persona' | 'additional-info' | 'strategy-generation';

export interface OnboardingFormData {
  // Company Info
  companyName: string;
  companyDescription?: string;
  industry: string;
  companySize?: string;
  
  // Persona
  personaName?: string;
  personaDescription?: string;
  goals?: string[];
  tone?: string;
  
  // Additional Info
  additionalInfo?: string;
}

export interface OnboardingStepInfo {
  id: OnboardingStep;
  label: string;
  validationFields: (keyof OnboardingFormData)[];
}
