
import React from 'react';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';
import OnboardingProgress from './OnboardingProgress';
import StepContent from './StepContent';
import StepNavigation from './StepNavigation';
import OnboardingErrorDialog from './OnboardingErrorDialog';

// Define prop interfaces to match the component usage
interface OnboardingProgressProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  steps: Array<{id: string, label: string}>;
}

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  isNextDisabled: boolean;
  isGenerating: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => Promise<void>;
}

const OnboardingWizard: React.FC = () => {
  const {
    steps,
    currentStep,
    step,
    formData,
    error,
    isSubmitting,
    isGeneratingStrategy,
    updateFormData,
    handleStepClick,
    handleNextStep,
    handlePrevStep,
    handleSubmit,
    isStepValid,
    resetError,
    setFieldValue
  } = useOnboardingWizard();

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-full">
      {/* Progress indicators */}
      <OnboardingProgress 
        steps={steps} 
        currentStep={currentStep} 
        onStepClick={handleStepClick} 
      />
      
      {/* Form content */}
      <div className="flex-1 overflow-y-auto my-6 px-4 md:px-0">
        <StepContent 
          step={step.id}
          formData={formData}
          updateFormData={updateFormData}
          isGenerating={isGeneratingStrategy}
          setFieldValue={setFieldValue}
        />
      </div>
      
      {/* Navigation buttons */}
      <StepNavigation 
        currentStep={currentStep} 
        totalSteps={steps.length}
        isSubmitting={isSubmitting}
        isGenerating={isGeneratingStrategy}
        isNextDisabled={!isStepValid()}
        onNext={handleNextStep}
        onPrev={handlePrevStep}
        onSubmit={handleSubmit}
      />
      
      {/* Error dialog */}
      {error && (
        <OnboardingErrorDialog 
          error={error}
          onClose={resetError}
        />
      )}
    </div>
  );
};

export default OnboardingWizard;
