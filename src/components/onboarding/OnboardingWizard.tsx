
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useOnboardingWizard, OnboardingFormData } from '@/hooks/useOnboardingWizard';

// UI Components
import OnboardingProgress from './OnboardingProgress';
import StepNavigation from './StepNavigation';
import StepContent, { stepTitles, stepDetails } from './StepContent';
import OnboardingErrorDialog from './OnboardingErrorDialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import StrategyGenerationStep from './steps/StrategyGenerationStep';

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
    validateCurrentStep,
    isGeneratingStrategy
  } = useOnboardingWizard();

  // Redirect to dashboard if user already has tenants
  if (tenants && tenants.length > 0) {
    return <Navigate to="/dashboard" replace />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const currentStepData = stepDetails[currentStep];
  const { errors } = validateCurrentStep();
  const hasValidationErrors = Object.keys(errors).length > 0;
  
  // If we're in the final step and strategy generation is in process
  const isStrategyGenerationStep = currentStep === stepDetails.length - 1;

  return (
    <ErrorBoundary tenant_id="system" supportEmail="support@alloraos.com">
      <div className="flex items-center justify-center min-h-screen bg-background py-8 px-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center sm:text-left">
            <CardTitle className="text-xl md:text-2xl">{currentStepData.title}</CardTitle>
            <CardDescription className="text-sm md:text-base">{currentStepData.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <OnboardingProgress 
              currentStep={currentStep} 
              totalSteps={stepDetails.length} 
              stepTitles={stepTitles}
              onStepClick={handleStepClick}
            />
            
            {hasValidationErrors && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Validation Error</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 mt-2">
                    {Object.values(errors).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {isStrategyGenerationStep && isGeneratingStrategy ? (
              <StrategyGenerationStep />
            ) : (
              <StepContent 
                currentStep={currentStep}
                formData={formData}
                updateFormData={updateFormData}
              />
            )}
            
            <StepNavigation
              currentStep={currentStep}
              totalSteps={stepDetails.length}
              onPrevious={handlePrevStep}
              onNext={handleNextStep}
              onComplete={handleSubmit}
              isNextDisabled={!isStepValid()}
              isSubmitting={isSubmitting || isGeneratingStrategy}
            />
          </CardContent>
        </Card>

        <OnboardingErrorDialog error={error} onClose={resetError} tenant_id="system" />
      </div>
    </ErrorBoundary>
  );
};

export default OnboardingWizard;
