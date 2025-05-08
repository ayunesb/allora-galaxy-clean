
import React from 'react';
import { OnboardingStep, OnboardingFormData } from '@/types/onboarding';
import CompanyInfoStep from './steps/CompanyInfoStep';
import PersonaStep from './steps/PersonaStep';
import AdditionalInfoStep from './steps/AdditionalInfoStep';
import StrategyGenerationStep from './steps/StrategyGenerationStep';

export interface StepContentProps {
  step: OnboardingStep;
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  isGenerating?: boolean;
  setFieldValue: (key: string, value: any) => void;
}

// Define props for each step component
export interface CompanyInfoStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  setFieldValue: (key: string, value: any) => void;
}

export interface PersonaStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  setFieldValue: (key: string, value: any) => void;
}

export interface AdditionalInfoStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  setFieldValue: (key: string, value: any) => void;
}

export interface StrategyGenerationStepProps {
  formData: OnboardingFormData;
  isGenerating?: boolean;
}

const StepContent: React.FC<StepContentProps> = ({ 
  step, 
  formData,
  updateFormData,
  isGenerating,
  setFieldValue
}) => {
  // Render the appropriate step content based on the current step
  switch (step) {
    case 'company-info':
      return (
        <CompanyInfoStep 
          formData={formData}
          updateFormData={updateFormData}
          setFieldValue={setFieldValue}
        />
      );
    
    case 'persona':
      return (
        <PersonaStep 
          formData={formData}
          updateFormData={updateFormData}
          setFieldValue={setFieldValue}
        />
      );
    
    case 'additional-info':
      return (
        <AdditionalInfoStep 
          formData={formData}
          updateFormData={updateFormData}
          setFieldValue={setFieldValue}
        />
      );
    
    case 'strategy-generation':
      return (
        <StrategyGenerationStep 
          formData={formData}
          isGenerating={isGenerating}
        />
      );
    
    default:
      return <div>Unknown step</div>;
  }
};

export default StepContent;
