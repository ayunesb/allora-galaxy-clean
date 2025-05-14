
import React from 'react';
import CompanyInfoStep from './steps/CompanyInfoStep';
import PersonaStep from './steps/PersonaStep';
import AdditionalInfoStep from './steps/AdditionalInfoStep';
import StrategyGenerationStep from './steps/StrategyGenerationStep';
import { OnboardingFormData } from '@/types/onboarding';

export type OnboardingStep = 'welcome' | 'company-info' | 'persona' | 'additional-info' | 'strategy-generation' | 'completed';

export interface StepContentProps {
  currentStep: OnboardingStep;
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
}

export interface StrategyGenerationStepProps {
  formData: OnboardingFormData;
  isGenerating?: boolean;
}

const StepContent: React.FC<StepContentProps> = ({ 
  currentStep, 
  formData, 
  updateFormData
}) => {
  const setFieldValue = (key: string, value: any) => {
    updateFormData({ [key]: value });
  };

  switch (currentStep) {
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
        />
      );
    default:
      return <div>Step not found</div>;
  }
};

export default StepContent;
