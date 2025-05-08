
import { OnboardingFormData, OnboardingStep, StepValidationResult } from '@/types/onboarding';

/**
 * Validates onboarding data for a specific step
 * @param data The onboarding form data
 * @param step The step being validated
 * @returns Validation result with any errors
 */
export function validateOnboardingData(data: OnboardingFormData, step: OnboardingStep): StepValidationResult {
  const errors: Record<string, string> = {};
  
  switch (step) {
    case 'company-info':
      if (!data.companyName?.trim()) {
        errors.companyName = 'Company name is required';
      }
      
      if (!data.industry?.trim()) {
        errors.industry = 'Industry is required';
      }
      
      if (!data.companySize?.trim()) {
        errors.companySize = 'Company size is required';
      }
      
      if (!data.description?.trim()) {
        errors.description = 'Description is required';
      }
      break;
      
    case 'persona':
      if (!data.persona?.name?.trim()) {
        errors['persona.name'] = 'Persona name is required';
      }
      
      if (!data.persona?.goals || data.persona.goals.length === 0) {
        errors['persona.goals'] = 'At least one persona goal is required';
      }
      
      if (!data.persona?.tone?.trim()) {
        errors['persona.tone'] = 'Persona tone is required';
      }
      break;
      
    case 'additional-info':
      if (!data.goals || (Array.isArray(data.goals) && data.goals.length === 0)) {
        errors.goals = 'At least one goal is required';
      }
      break;
      
    case 'strategy-generation':
      // No validation needed for the final step
      break;
      
    default:
      // No validation for unknown steps
      break;
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
