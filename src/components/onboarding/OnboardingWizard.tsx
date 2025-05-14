
import React, { useState } from 'react';
import { OnboardingProgress } from './OnboardingProgress';
import { StepContent } from './StepContent';
import { StepNavigation } from './StepNavigation';
import { OnboardingErrorDialog } from './OnboardingErrorDialog';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';
import { OnboardingStep } from '@/types/shared';

export const OnboardingWizard: React.FC = () => {
  const {
    currentStep,
    formData,
    progress,
    isLoading,
    nextStep,
    prevStep,
    goToStep,
    updateFormData,
    resetForm,
    submitForm,
    completeOnboardingProcess
  } = useOnboardingWizard();

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStepClick = (step: OnboardingStep) => {
    goToStep(step);
  };

  const handleNextStep = async () => {
    if (currentStep === 'strategy-generation') {
      setIsSubmitting(true);
      try {
        await submitForm();
        await completeOnboardingProcess();
        nextStep();
      } catch (error: any) {
        setError(error.message || 'Failed to complete onboarding');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      nextStep();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <OnboardingProgress 
        currentStep={currentStep}
        progress={progress}
        onStepClick={handleStepClick}
      />
      
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <StepContent 
          currentStep={currentStep}
          formData={formData}
          updateFormData={updateFormData}
        />
        
        <StepNavigation
          currentStep={currentStep}
          onPrevious={prevStep}
          onNext={handleNextStep}
          isLoading={isLoading || isSubmitting}
        />
      </div>
      
      {error && (
        <OnboardingErrorDialog
          error={error}
          onClose={() => setError(null)}
          onRetry={handleNextStep}
        />
      )}
    </div>
  );
};

export default OnboardingWizard;
