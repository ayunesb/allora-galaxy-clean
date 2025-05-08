import React from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';
import { OnboardingFormData } from '@/types/onboarding';

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
    tenantsList,
    currentUser,
    updateFormData,
    handleNextStep,
    handlePrevStep,
    handleStepClick,
    handleSubmit,
    isStepValid,
    resetError,
    validateCurrentStep,
    setFieldValue,
    isGeneratingStrategy
  } = useOnboardingWizard();

  // Redirect to dashboard if user already has tenants
  if (tenantsList && tenantsList.length > 0) {
    return <Navigate to="/dashboard" replace />;
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  const currentStepData = stepDetails[currentStep];
  const validationResult = validateCurrentStep();
  const hasValidationErrors = validationResult.errors && Object.keys(validationResult.errors).length > 0;
  
  // Check if we're in the final step (strategy generation)
  const isStrategyGenerationStep = currentStep === stepDetails.length - 1;
  const totalSteps = stepDetails.length;

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
              totalSteps={totalSteps} 
              stepTitles={stepTitles}
              onStepClick={(step) => handleStepClick(step)}
            />
            
            {hasValidationErrors && validationResult.errors && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Validation Error</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 mt-2">
                    {Object.values(validationResult.errors).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {isStrategyGenerationStep ? (
              <StrategyGenerationStep 
                formData={formData} 
                updateFormData={updateFormData}
                isGenerating={isGeneratingStrategy}
                setFieldValue={(key: string, value: any) => setFieldValue(key, value)}
              />
            ) : (
              <StepContent 
                currentStep={currentStep}
                formData={formData}
                updateFormData={updateFormData}
                setFieldValue={(key: string, value: any) => setFieldValue(key, value)}
              />
            )}
            
            <StepNavigation
              currentStep={currentStep}
              totalSteps={totalSteps}
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
