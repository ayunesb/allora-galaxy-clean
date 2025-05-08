
import { OnboardingFormData, OnboardingStep, StepValidationResult } from '@/types/onboarding';

/**
 * Validates onboarding data for a specific step
 * @param formData The form data to validate
 * @param step The current step being validated
 * @returns Validation result with any errors
 */
export function validateOnboardingData(
  formData: OnboardingFormData, 
  step: OnboardingStep
): StepValidationResult {
  const errors: Record<string, string> = {};
  
  switch (step) {
    case 'company-info':
      // Validate company name
      if (!formData.companyName?.trim()) {
        errors.companyName = 'Company name is required';
      }
      
      // Validate industry
      if (!formData.industry?.trim()) {
        errors.industry = 'Industry is required';
      }
      
      // Validate company size
      if (!formData.companySize?.trim()) {
        errors.companySize = 'Company size is required';
      }
      
      // Validate description (required)
      if (!formData.description?.trim()) {
        errors.description = 'Company description is required';
      } else if (formData.description.trim().length < 50) {
        errors.description = 'Description should be at least 50 characters';
      }
      break;
      
    case 'persona':
      // Validate persona name
      if (!formData.persona?.name?.trim()) {
        errors['persona.name'] = 'Persona name is required';
      }
      
      // Validate goals (at least one)
      if (!formData.persona?.goals || formData.persona.goals.length === 0) {
        errors['persona.goals'] = 'At least one persona goal is required';
      }
      
      // Validate tone
      if (!formData.persona?.tone?.trim()) {
        errors['persona.tone'] = 'Communication tone is required';
      }
      break;
      
    case 'additional-info':
      // Validate company goals (at least one)
      if (Array.isArray(formData.goals) && formData.goals.length === 0) {
        errors.goals = 'At least one company goal is required';
      } else if (!Array.isArray(formData.goals) && !formData.goals?.trim()) {
        errors.goals = 'Company goals are required';
      }
      
      // Additional info is optional, no validation needed
      break;
      
    case 'strategy-generation':
      // No validation needed for the strategy preview step
      break;
      
    default:
      console.warn(`Unknown step: ${step}`);
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
