
import { useState } from 'react';
import { OnboardingFormData, StepValidationResult } from '@/types/onboarding';

/**
 * Custom hook for managing onboarding steps and validation
 */
export const useOnboardingSteps = (formData: OnboardingFormData) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  /**
   * Validates the current step based on required fields
   * @returns boolean indicating if the step is valid
   */
  const isStepValid = (): boolean => {
    const validationResult = validateCurrentStep();
    return validationResult.valid;
  };

  /**
   * Validates the current step and returns detailed validation results
   */
  const validateCurrentStep = (): StepValidationResult => {
    const errors: Record<string, string> = {};
    
    switch (currentStep) {
      case 0:
        // Company info validation
        if (!formData.companyName?.trim()) {
          errors.companyName = 'Company name is required';
        }
        if (!formData.industry?.trim()) {
          errors.industry = 'Industry is required';
        }
        if (!formData.companySize?.trim()) {
          errors.companySize = 'Company size is required';
        }
        if (!formData.revenueRange?.trim()) {
          errors.revenueRange = 'Revenue range is required';
        }
        break;
        
      case 1:
        // Additional info is optional, no validation required
        break;
        
      case 2:
        // Persona validation
        if (!formData.persona?.name?.trim()) {
          errors.personaName = 'Persona name is required';
        }
        if (!formData.persona?.tone?.trim()) {
          errors.tone = 'Tone is required';
        }
        if (Array.isArray(formData.goals) ? formData.goals.length === 0 : !formData.goals?.trim()) {
          errors.goals = 'Goals are required';
        }
        break;
        
      default:
        // Shouldn't happen, but add a safety check
        errors._general = 'Invalid step';
        break;
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  };

  /**
   * Move to the next step
   */
  const handleNextStep = () => {
    if (isStepValid()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  /**
   * Move to the previous step
   */
  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  /**
   * Move to a specific step (only if previous steps are valid)
   */
  const handleStepClick = (step: number) => {
    // Allow backward navigation without validation
    if (step < currentStep) {
      setCurrentStep(step);
      return;
    }
    
    // For forward navigation, validate all steps in between
    let isValid = true;
    let stepToValidate = currentStep;
    
    while (stepToValidate < step && isValid) {
      // Store current step
      const tempStep = currentStep;
      
      // Temporarily set step to validate the required step
      setCurrentStep(stepToValidate);
      isValid = isStepValid();
      
      // Restore actual current step
      setCurrentStep(tempStep);
      
      if (isValid) {
        stepToValidate++;
      }
    }
    
    if (isValid) {
      setCurrentStep(step);
    }
  };

  return {
    currentStep,
    handleNextStep,
    handlePrevStep,
    handleStepClick,
    isStepValid,
    validateCurrentStep,
  };
};
