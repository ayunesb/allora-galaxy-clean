
import { OnboardingFormData, OnboardingStep } from '@/types/onboarding';

/**
 * Validate onboarding data based on the current step
 */
export function validateOnboardingData(
  formData: OnboardingFormData,
  currentStep: OnboardingStep
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  switch (currentStep) {
    case 'company-info':
      // Company name validation
      if (!formData.companyName || formData.companyName.trim() === '') {
        errors.companyName = 'Company name is required';
      }
      
      // Industry validation
      if (!formData.industry || formData.industry === '') {
        errors.industry = 'Industry is required';
      }
      
      // Company size validation
      if (!formData.companySize || formData.companySize === '') {
        errors.companySize = 'Company size is required';
      }
      
      // Team size validation (if present in form data)
      if ('teamSize' in formData && formData.teamSize === '') {
        errors.teamSize = 'Team size is required if provided';
      }
      
      // Revenue range validation (if present in form data)
      if ('revenueRange' in formData && formData.revenueRange === '') {
        errors.revenueRange = 'Revenue range is required if provided';
      }
      
      // Website validation (if present in form data)
      if ('website' in formData && formData.website && !isValidUrl(formData.website)) {
        errors.website = 'Please enter a valid website URL';
      }
      break;
      
    case 'persona':
      // Persona name validation
      if (!formData.persona.name || formData.persona.name === '') {
        errors['persona.name'] = 'Persona name is required';
      }
      
      // Tone validation
      if (!formData.persona.tone || formData.persona.tone === '') {
        errors['persona.tone'] = 'Communication tone is required';
      }
      
      // Goals validation
      if (!formData.persona.goals || formData.persona.goals.length === 0 || 
          !formData.persona.goals.some(goal => goal && goal.trim() !== '')) {
        errors['persona.goals'] = 'At least one goal is required';
      }
      break;
      
    case 'additional-info':
      // No required validation for additional info
      break;
      
    case 'strategy-generation':
      // No validation needed for strategy generation step
      break;
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate a URL string
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
}
