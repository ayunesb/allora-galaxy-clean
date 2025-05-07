
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useOnboardingWizard, OnboardingFormData } from '@/hooks/useOnboardingWizard';

// UI Components
import OnboardingProgress from './OnboardingProgress';
import StepNavigation from './StepNavigation';
import StepContent, { stepTitles, stepDetails } from './StepContent';
import OnboardingErrorDialog from './OnboardingErrorDialog';

const OnboardingWizard: React.FC = () => {
  const {
    currentStep,
    isSubmitting,
    error,
    formData,
    tenants,
    user,
    updateFormData,
    handleNextStep,
    handlePrevStep,
    handleStepClick,
    handleSubmit,
    isStepValid,
    resetError,
  } = useOnboardingWizard();

  // Redirect to dashboard if user already has tenants
  if (tenants.length > 0) {
    return <Navigate to="/" replace />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const currentStepData = stepDetails[currentStep];

  return (
    <ErrorBoundary tenant_id="system" supportEmail="support@alloraos.com">
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>{currentStepData.title}</CardTitle>
            <CardDescription>{currentStepData.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <OnboardingProgress 
              currentStep={currentStep} 
              totalSteps={stepDetails.length} 
              stepTitles={stepTitles}
              onStepClick={handleStepClick}
            />
            
            <StepContent 
              currentStep={currentStep}
              formData={formData}
              updateFormData={updateFormData}
            />
            
            <StepNavigation
              currentStep={currentStep}
              totalSteps={stepDetails.length}
              onPrevious={handlePrevStep}
              onNext={handleNextStep}
              onComplete={handleSubmit}
              isNextDisabled={!isStepValid()}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>

        <OnboardingErrorDialog error={error} onClose={resetError} />
      </div>
    </ErrorBoundary>
  );
};

export default OnboardingWizard;
