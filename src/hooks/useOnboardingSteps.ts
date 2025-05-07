
import { useState } from 'react';
import { OnboardingFormData } from '@/types/onboarding';

/**
 * Custom hook for managing onboarding steps and validation
 */
export const useOnboardingSteps = (formData: OnboardingFormData) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  /**
   * Validates the current step based on required fields
   */
  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return !!(formData.companyName && formData.industry && formData.teamSize && formData.revenueRange);
      case 1:
        return true; // Additional info is optional
      case 2:
        return !!(formData.personaName && formData.tone && formData.goals);
      default:
        return false;
    }
  };

  /**
   * Move to the next step
   */
  const handleNextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  /**
   * Move to the previous step
   */
  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  /**
   * Move to a specific step
   */
  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  return {
    currentStep,
    handleNextStep,
    handlePrevStep,
    handleStepClick,
    isStepValid,
  };
};
