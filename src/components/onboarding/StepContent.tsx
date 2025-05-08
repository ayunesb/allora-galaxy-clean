
import React from 'react';
import CompanyInfoStep from './steps/CompanyInfoStep';
import PersonaStep from './steps/PersonaStep';
import AdditionalInfoStep from './steps/AdditionalInfoStep';
import StrategyGenerationStep from './steps/StrategyGenerationStep';
import { OnboardingStep, OnboardingFormData } from '@/types/onboarding';

export interface StepContentProps {
  step: OnboardingStep;
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  setFieldValue: (key: string, value: any) => void;
  isGeneratingStrategy?: boolean;
}

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
}

export interface StrategyGenerationStepProps {
  formData: OnboardingFormData;
  isGenerating?: boolean;
}

const StepContent: React.FC<StepContentProps> = ({ 
  step, 
  formData, 
  updateFormData,
  setFieldValue,
  isGeneratingStrategy 
}) => {
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
        />
      );
    case 'strategy-generation':
      return (
        <StrategyGenerationStep 
          formData={formData} 
          isGenerating={isGeneratingStrategy} 
        />
      );
    default:
      return <div>Step not found</div>;
  }
};

export default StepContent;
