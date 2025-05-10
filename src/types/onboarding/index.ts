
import { OnboardingStep } from '../onboarding';

// Define persona type
export interface PersonaProfile {
  name: string;
  goals: string[];
  tone: string;
}

// Define the form data type for onboarding
export interface OnboardingFormData {
  companyName: string;
  industry: string;
  companySize: string;
  website?: string;
  revenueRange: string;
  description: string;
  goals: string[];
  additionalInfo?: string;
  persona: PersonaProfile;
  [key: string]: any; // Allow additional properties
}
