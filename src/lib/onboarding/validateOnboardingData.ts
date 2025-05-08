
import { OnboardingFormData, OnboardingStep } from "@/types/onboarding";

/**
 * Validates the onboarding data for a specific step
 * @param formData The onboarding form data
 * @param step The step to validate
 * @returns Validation result
 */
export function validateOnboardingData(formData: OnboardingFormData, step: OnboardingStep) {
  const errors: string[] = [];

  switch (step) {
    case 'company-info':
      // Company name is required
      if (!formData.companyName || formData.companyName.trim() === '') {
        errors.push('Company name is required');
      }
      
      // Industry is required
      if (!formData.industry || formData.industry.trim() === '') {
        errors.push('Industry is required');
      }
      
      // Company size is required
      if (!formData.companySize || formData.companySize.trim() === '') {
        errors.push('Company size is required');
      }
      
      // Revenue range should be selected
      if (!formData.revenueRange || formData.revenueRange.trim() === '') {
        errors.push('Revenue range is required');
      }
      
      break;
    
    case 'persona':
      // Persona name is required
      if (!formData.persona || !formData.persona.name || formData.persona.name.trim() === '') {
        errors.push('Persona name is required');
      }
      
      // Persona tone is required
      if (!formData.persona || !formData.persona.tone || formData.persona.tone.trim() === '') {
        errors.push('Persona tone is required');
      }
      
      // At least one goal is required
      if (!formData.persona || !formData.persona.goals || formData.persona.goals.length === 0 ||
          formData.persona.goals.every((goal) => goal.trim() === '')) {
        errors.push('At least one persona goal is required');
      }
      
      break;
    
    case 'additional-info':
      // No validations - this step is optional
      break;
    
    case 'strategy-generation':
      // No validations - this step is just for showing strategy generation
      break;
    
    default:
      errors.push('Unknown step');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
