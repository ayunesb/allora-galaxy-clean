
import React, { useState } from 'react';
import OnboardingProgress from './OnboardingProgress';
import StepContent from './StepContent';
import StepNavigation from './StepNavigation';
import { OnboardingErrorDialog } from './OnboardingErrorDialog';

// Use a local OnboardingStep type that matches what StepContent expects
type OnboardingStep = 'welcome' | 'company-info' | 'persona' | 'additional-info' | 'strategy-generation' | 'completed';

interface OnboardingWizardProps {
  initialStep?: number;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ initialStep = 0 }) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    revenueRange: '',
    description: '',
    goals: [],
    additionalInfo: '',
    persona: {
      name: '',
      goals: [],
      tone: 'professional'
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Define our steps
  const steps = [
    'company-info',
    'additional-info',
    'persona',
    'strategy-generation',
    'completed'
  ] as const;

  // Calculate progress percentage
  const progress = Math.round((currentStep / (steps.length - 1)) * 100);

  // Convert step index to step name for StepContent
  const getStepNameFromIndex = (stepIndex: number): OnboardingStep => {
    return steps[stepIndex] as OnboardingStep || 'company-info';
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (data: any) => {
    setFormData(prevData => ({ ...prevData, ...data }));
  };

  const completeOnboardingProcess = async () => {
    if (currentStep === 3) { // Index 3 is 'strategy-generation'
      setIsSubmitting(true);
      try {
        // Implementation would go here in a real app
        // Mock a delay
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
        nextStep();
      } catch (error: any) {
        setError(error.message || 'Failed to complete onboarding');
      } finally {
        setIsSubmitting(false);
      }
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
          totalSteps={steps.length}
          isSubmitting={isSubmitting}
          isNextDisabled={isLoading}
          onNext={currentStep === 3 ? completeOnboardingProcess : nextStep}
          onPrev={prevStep}
          onSubmit={completeOnboardingProcess}
        />
      </div>
      
      {error && (
        <OnboardingErrorDialog
          error={error}
          onClose={() => setError(null)}
          onRetry={completeOnboardingProcess}
        />
      )}
    </div>
  );
};

export default OnboardingWizard;
