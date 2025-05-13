
import React from 'react';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';
import OnboardingProgress from './OnboardingProgress';
import StepContent from './StepContent';
import StepNavigation from './StepNavigation';
import { OnboardingStep, OnboardingFormData } from '@/types/onboarding';

// Define steps for the onboarding process
const STEPS = [
  { id: 'welcome' as OnboardingStep, label: 'Welcome' },
  { id: 'company-info' as OnboardingStep, label: 'Company Info' },
  { id: 'persona' as OnboardingStep, label: 'Persona' },
  { id: 'additional-info' as OnboardingStep, label: 'Additional Info' },
  { id: 'strategy-generation' as OnboardingStep, label: 'Strategy' },
  { id: 'completed' as OnboardingStep, label: 'Complete' }
];

const OnboardingWizard: React.FC = () => {
  const {
    currentStep,
    formData,
    isGenerating,
    updateFormData,
    nextStep,
    prevStep,
    completeOnboarding
  } = useOnboardingWizard();

  // Helper function to get current step index
  const getCurrentStepIndex = (): number => {
    const stepIndex = typeof currentStep === 'number' 
      ? currentStep 
      : STEPS.findIndex(step => step.id === currentStep);
    return stepIndex >= 0 ? stepIndex : 0;
  };

  // Helper function to determine if the next button should be disabled
  const isNextButtonDisabled = (): boolean => {
    // Add validation logic here based on currentStep
    return false;
  };
  
  // Create a wrapper for updateFormData to match the expected signature
  const handleUpdateFormData = (data: Partial<OnboardingFormData>) => {
    updateFormData(data);
  };
  
  // Handle submission
  const handleSubmit = () => {
    completeOnboarding();
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-full">
      {/* Progress indicators */}
      <OnboardingProgress 
        currentStep={getCurrentStepIndex()} 
        onStepClick={() => {
          // Optional: Add step navigation logic here
        }}
        steps={STEPS}
      />
      
      {/* Form content */}
      <div className="flex-1 overflow-y-auto my-6 px-4 md:px-0">
        <StepContent 
          step={typeof currentStep === 'number' ? STEPS[currentStep]?.id || 'welcome' : currentStep}
          formData={formData}
          updateFormData={handleUpdateFormData}
          isGenerating={isGenerating}
          setFieldValue={(key: string, value: any) => {
            handleUpdateFormData({ [key]: value });
          }}
        />
      </div>
      
      {/* Navigation buttons */}
      <StepNavigation 
        currentStep={getCurrentStepIndex()} 
        totalSteps={STEPS.length}
        isSubmitting={isGenerating}
        isNextDisabled={isNextButtonDisabled()}
        onNext={nextStep}
        onPrev={prevStep}
        onSubmit={handleSubmit}
        isGenerating={isGenerating}
      />
    </div>
  );
};

export default OnboardingWizard;
