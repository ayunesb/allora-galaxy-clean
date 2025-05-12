
import React from 'react';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';
import OnboardingProgress from './OnboardingProgress';
import StepContent from './StepContent';
import StepNavigation from './StepNavigation';
import { OnboardingStep } from '@/types/shared';

// Define steps for the onboarding process
const STEPS = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'company_info', label: 'Company Info' },
  { id: 'persona', label: 'Persona' },
  { id: 'additional_info', label: 'Additional Info' },
  { id: 'strategy_generation', label: 'Strategy' },
  { id: 'complete', label: 'Complete' }
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

  // Current step content
  const currentStepData = STEPS.find(step => step.id === currentStep) || STEPS[0];
  
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-full">
      {/* Progress indicators */}
      <OnboardingProgress 
        currentStep={getCurrentStepIndex()} 
        onStepClick={(index: number) => {
          // Optional: Add step navigation logic here
        }}
        steps={STEPS.map(s => ({ id: s.id, label: s.label }))}
      />
      
      {/* Form content */}
      <div className="flex-1 overflow-y-auto my-6 px-4 md:px-0">
        <StepContent 
          step={currentStep}
          formData={formData}
          updateFormData={updateFormData}
          isGenerating={isGenerating}
          setFieldValue={(field, value) => {
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
