
import { useState } from 'react';
import { OnboardingFormData, OnboardingStep } from '@/types/onboarding';
import { validateOnboardingData } from '@/lib/onboarding/validateOnboardingData';

/**
 * Hook to manage onboarding form state and validation
 */
export function useOnboardingForm() {
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
  const updateFormData = (data: Partial<OnboardingFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };
  
  // Set a specific field value
  const setFieldValue = (key: string, value: any) => {
    // Handle nested fields like persona.name
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof OnboardingFormData] as Record<string, any>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [key]: value }));
    }
  };
  
  // Validate specific step
  const validateStep = (step: OnboardingStep) => {
    return validateOnboardingData(formData, step);
  };

  return {
    formData,
    updateFormData,
    setFieldValue,
    validateStep
  };
}
