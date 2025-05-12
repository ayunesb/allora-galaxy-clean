
// Onboarding specific types
export interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  isCompleted?: boolean;
  isActive?: boolean;
  order: number;
  component?: React.ComponentType<any>;
}

export interface OnboardingFormData {
  companyName: string;
  industry: string;
  companySize: string;
  goals: string[];
  website?: string;
  description?: string;
  tone?: string;
}

export interface OnboardingContextType {
  currentStep: number;
  steps: OnboardingStep[];
  formData: OnboardingFormData;
  setCurrentStep: (step: number) => void;
  setSteps: (steps: OnboardingStep[]) => void;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  nextStep: () => void;
  previousStep: () => void;
  isLastStep: boolean;
  isFirstStep: boolean;
  progress: number;
}
