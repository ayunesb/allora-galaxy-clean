
import { OnboardingFormData, OnboardingStep, ValidationResult } from "@/types/onboarding";

/**
 * Validates the onboarding data for a specific step
 */
export const validateOnboardingData = (
  formData: OnboardingFormData | string,
  stepId: OnboardingStep
): ValidationResult => {
  const data = typeof formData === 'string' ? {} as OnboardingFormData : formData;
  const errors: Record<string, string> = {};
  
  switch (stepId) {
    case 'company-info':
      if (!data.companyName?.trim()) {
        errors.companyName = 'Company name is required';
      }
      
      if (!data.industry?.trim()) {
        errors.industry = 'Industry is required';
      }
      break;
      
    case 'persona':
      if (!data.persona?.name?.trim()) {
        errors.personaName = 'Persona name is required';
      }
      break;
      
    case 'additional-info':
      // No required fields
      break;
      
    case 'strategy-generation':
      // No required fields
      break;
      
    default:
      errors.general = 'Invalid step';
      break;
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors: errors,
  };
};
