
import React from 'react';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';
import OnboardingProgress from './OnboardingProgress';
import StepContent from './StepContent';
import StepNavigation from './StepNavigation';
import { OnboardingStep } from '@/types/onboarding';

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
    handleSubmit
  } = useOnboardingWizard();

  // Helper function to get current step index
  const getCurrentStepIndex = (): number => {
    return STEPS.findIndex(step => step.id === currentStep);
  };

  // Helper function to determine if the next button should be disabled
  const isNextButtonDisabled = (): boolean => {
    // Add validation logic here based on currentStep
    return false;
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
          step={currentStep}
          formData={formData}
          updateFormData={(section: keyof typeof formData, value: any) => {
            updateFormData(section, value);
          }}
          isGenerating={isGenerating}
          setFieldValue={(field: string, value: any) => {
            // Extract section and field name
            const [section, fieldName] = field.split('.');
            if (section && fieldName && section in formData) {
              updateFormData(section as keyof typeof formData, { [fieldName]: value });
            }
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
