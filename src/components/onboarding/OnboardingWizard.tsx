
import React, { useState } from 'react';
import OnboardingProgress from './OnboardingProgress';
import StepContent from './StepContent';
import StepNavigation from './StepNavigation';
import { OnboardingErrorDialog } from './OnboardingErrorDialog';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';

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
    completeOnboardingProcess
  } = useOnboardingWizard();

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert step index to step name for StepContent
  const getStepNameFromIndex = (stepIndex: number): string => {
    const steps = [
      'company-info',
      'additional-info',
      'persona',
      'strategy-generation',
      'completed'
    ];
    return steps[stepIndex] || steps[0];
  };

  const handleStepClick = (stepIndex: number) => {
    goToStep(stepIndex);
  };

  const handleNextStep = async () => {
    if (currentStep === 3) { // Index 3 is 'strategy-generation'
      setIsSubmitting(true);
      try {
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
          currentStep={getStepNameFromIndex(currentStep)}
          formData={formData}
          updateFormData={updateFormData}
        />
        
        <StepNavigation
          currentStep={currentStep}
          totalSteps={5}
          isSubmitting={isSubmitting}
          isNextDisabled={isLoading}
          onNext={handleNextStep}
          onPrev={prevStep}
          onSubmit={completeOnboardingProcess}
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
