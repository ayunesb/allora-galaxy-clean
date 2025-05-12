
import { OnboardingFormData } from '@/types/onboarding';

/**
 * Initial state for the onboarding form
 */
export const initialOnboardingState: OnboardingFormData = {
  companyName: '',
  industry: '',
  companySize: '',
  revenueRange: '',
  website: '',
  description: '',
  goals: [],
  companyInfo: {
    name: '',
    industry: '',
    size: ''
  },
  persona: {
    name: '',
    goals: [],
    tone: ''
  },
  additionalInfo: {
    targetAudience: '',
    keyCompetitors: '',
    uniqueSellingPoints: ''
  }
};

/**
 * Validates that the required fields for a step are filled
 */
export const validateStep = (formData: OnboardingFormData, step: string): boolean => {
  switch (step) {
    case 'company-info':
      return Boolean(formData.companyInfo?.name && formData.companyInfo?.industry);
    case 'persona':
      return Boolean(formData.persona?.name && formData.persona?.goals?.length);
    case 'additional-info':
      return Boolean(
        formData.additionalInfo && 
        typeof formData.additionalInfo === 'object' &&
        formData.additionalInfo.targetAudience &&
        formData.additionalInfo.keyCompetitors
      );
    default:
      return true;
  }
};

/**
 * Merge partial form data with existing data
 */
export const mergeFormData = (
  existing: OnboardingFormData,
  partial: Partial<OnboardingFormData>
): OnboardingFormData => {
  return {
    ...existing,
    ...partial,
    // Handle nested objects properly
    companyInfo: {
      ...(existing.companyInfo || {}),
      ...(partial.companyInfo || {})
    },
    persona: {
      ...(existing.persona || {}),
      ...(partial.persona || {})
    },
    additionalInfo: {
      ...(existing.additionalInfo && typeof existing.additionalInfo === 'object' 
        ? existing.additionalInfo 
        : { targetAudience: '', keyCompetitors: '', uniqueSellingPoints: '' }),
      ...(partial.additionalInfo && typeof partial.additionalInfo === 'object' 
        ? partial.additionalInfo 
        : {})
    }
  };
};
