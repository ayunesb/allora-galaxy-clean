
import React from 'react';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';
import OnboardingProgress from './OnboardingProgress';
import StepContent from './StepContent';
import StepNavigation from './StepNavigation';
import OnboardingErrorDialog from './OnboardingErrorDialog';

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
        currentStep={currentStep} 
        onStepClick={handleStepClick}
        steps={steps.map(s => ({ id: s.id, label: s.label }))}
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
        isNextDisabled={!isStepValid()}
        onNext={handleNextStep}
        onPrev={handlePrevStep}
        onSubmit={handleSubmit}
        isGenerating={isGeneratingStrategy}
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
