
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
