
export type OnboardingStep = 'welcome' | 'company-info' | 'persona' | 'additional-info' | 'strategy-generation' | 'completed';

export interface OnboardingFormData {
  companyInfo: {
    name: string;
    industry: string;
    size: string;
  };
  persona: {
    name: string;
    goals: string[];
    tone: string;
  };
  additionalInfo: {
    targetAudience: string;
    keyCompetitors: string;
    uniqueSellingPoints: string;
  };
  [key: string]: any;
}
