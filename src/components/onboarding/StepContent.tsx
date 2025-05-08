
import React from 'react';
import { OnboardingFormData } from '@/types/onboarding';
import CompanyInfoStep from './steps/CompanyInfoStep';
import PersonaStep from './steps/PersonaStep';
import AdditionalInfoStep from './steps/AdditionalInfoStep';

// Export step titles and details for OnboardingWizard
export const stepTitles = [
  'Company Information',
  'Target Persona',
  'Additional Information',
  'Strategy Generation',
];

export const stepDetails = [
  {
    title: 'Company Information',
    description: 'Tell us about your company to customize your experience.',
  },
  {
    title: 'Target Persona',
    description: 'Define your target audience to optimize your strategies.',
  },
  {
    title: 'Additional Information',
    description: 'Help us tailor the AI to your specific needs.',
  },
  {
    title: 'Generate Your Strategy',
    description: 'We\'ll create a custom strategy based on your inputs.',
  },
];

export interface StepContentProps {
  currentStep: number;
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  setFieldValue?: (key: string, value: any) => void;
  isGenerating?: boolean;
}

const StepContent: React.FC<StepContentProps> = ({ 
  currentStep, 
  formData, 
  updateFormData,
  setFieldValue = (key, value) => updateFormData({ [key]: value })
}) => {
  // Render the appropriate step based on currentStep
  switch (currentStep) {
    case 0:
      return (
        <CompanyInfoStep 
          formData={formData}
          updateFormData={updateFormData}
          setFieldValue={setFieldValue}
        />
      );
    case 1:
      return (
        <PersonaStep 
          formData={formData}
          updateFormData={updateFormData}
          setFieldValue={setFieldValue}
        />
      );
    case 2:
      return (
        <AdditionalInfoStep 
          formData={formData}
          updateFormData={updateFormData}
          setFieldValue={setFieldValue}
        />
      );
    default:
      return <div>Unknown step</div>;
  }
};

export default StepContent;
