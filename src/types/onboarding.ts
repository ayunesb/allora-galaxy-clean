
export type OnboardingStep = 'company-info' | 'persona' | 'additional-info' | 'strategy-generation';

export interface OnboardingFormData {
  companyName: string;
  industry: string;
  companySize: string;
  revenueRange: string;
  website: string;
  description: string;  // Required field
  goals: string[] | string;
  additionalInfo: string;
  persona: {
    name: string;
    goals: string[];
    tone: string;
  };
}

export interface StepValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export interface GenerateStrategyParams {
  tenant_id: string;
  company: {
    name: string;
    industry: string;
    size: string;
  };
  persona: {
    name: string;
    goals: string[];
    tone: string;
  };
  goals: string[];
  additionalInfo?: string;
}

export interface GenerateStrategyResult {
  success: boolean;
  error?: string;
  strategy?: {
    title: string;
    description: string;
    tags: string[];
  };
  tenantId?: string;
}

export interface OnboardingSubmissionResult {
  success: boolean;
  tenantId?: string;
  strategyId?: string;
  error?: string;
}
