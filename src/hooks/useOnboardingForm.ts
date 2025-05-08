
import { useState } from 'react';
import { OnboardingFormData } from '@/types/onboarding';

/**
 * Hook to manage onboarding form state
 */
export const useOnboardingForm = () => {
  // Form data state
  const [formData, setFormData] = useState<OnboardingFormData>({
    companyName: '',
    industry: '',
    companySize: '',
    revenueRange: '',
    website: '',
    description: '',
    goals: [] as string[],
    additionalInfo: '',
    persona: {
      name: '',
      goals: [] as string[],
      tone: ''
    }
  });

  // Update form data
  const updateFormData = (key: keyof OnboardingFormData, value: string | string[] | any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return {
    formData,
    updateFormData,
  };
};
