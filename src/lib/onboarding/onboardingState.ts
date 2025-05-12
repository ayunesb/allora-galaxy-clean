
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
 * Merge partial form data with existing data without duplicating properties
 */
export const mergeFormData = (
  existing: OnboardingFormData,
  partial: Partial<OnboardingFormData>
): OnboardingFormData => {
  // Clone the existing object to avoid mutation
  const result = { ...existing };
  
  // Handle top-level properties
  Object.keys(partial).forEach(key => {
    if (key !== 'companyInfo' && key !== 'persona' && key !== 'additionalInfo') {
      // @ts-ignore - Dynamic keys
      result[key] = partial[key];
    }
  });
  
  // Handle nested companyInfo
  if (partial.companyInfo) {
    result.companyInfo = {
      ...existing.companyInfo,
      ...partial.companyInfo
    };
  }
  
  // Handle nested persona
  if (partial.persona) {
    result.persona = {
      ...existing.persona,
      ...partial.persona
    };
  }
  
  // Handle nested additionalInfo
  if (partial.additionalInfo && typeof partial.additionalInfo === 'object') {
    result.additionalInfo = {
      ...existing.additionalInfo,
      ...partial.additionalInfo
    };
  }
  
  return result;
};
