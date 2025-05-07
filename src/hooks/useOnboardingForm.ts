
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
    teamSize: '',
    revenueRange: '',
    website: '',
    description: '',
    personaName: '',
    tone: '',
    goals: '',
  });

  // Update form data
  const updateFormData = (key: keyof OnboardingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return {
    formData,
    updateFormData,
  };
};
