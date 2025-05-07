
import { OnboardingFormData } from '@/hooks/useOnboardingWizard';

/**
 * Validates onboarding form data before submission
 * @param formData The onboarding form data to validate
 * @returns An object containing validation result and any error messages
 */
export function validateOnboardingData(formData: OnboardingFormData): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  
  // Company name validation
  if (!formData.companyName || formData.companyName.trim().length < 2) {
    errors.companyName = 'Company name must be at least 2 characters';
  }
  
  // Industry validation
  if (!formData.industry) {
    errors.industry = 'Please select an industry';
  }
  
  // Team size validation
  if (!formData.teamSize) {
    errors.teamSize = 'Please select team size';
  }
  
  // Revenue range validation
  if (!formData.revenueRange) {
    errors.revenueRange = 'Please select revenue range';
  }
  
  // Website validation (optional)
  if (formData.website && !isValidUrl(formData.website)) {
    errors.website = 'Please enter a valid URL';
  }
  
  // Persona name validation
  if (!formData.personaName || formData.personaName.trim().length < 2) {
    errors.personaName = 'Persona name must be at least 2 characters';
  }
  
  // Tone validation
  if (!formData.tone) {
    errors.tone = 'Please select a tone';
  }
  
  // Goals validation
  if (!formData.goals || formData.goals.trim().length < 5) {
    errors.goals = 'Please enter at least one goal';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates if a string is a properly formatted URL
 * @param url The URL to validate
 * @returns True if the URL is valid, false otherwise
 */
function isValidUrl(url: string): boolean {
  try {
    // Add protocol if missing
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    new URL(normalizedUrl);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Generates a safe slug from company name
 * @param companyName The company name to convert to a slug
 * @returns A URL-safe slug
 */
export function generateSlug(companyName: string): string {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
