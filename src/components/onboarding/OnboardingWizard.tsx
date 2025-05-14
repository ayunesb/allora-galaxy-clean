
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Steps } from '@/components/ui/steps';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { toast } from 'sonner';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
}

interface OnboardingWizardProps {
  steps: OnboardingStep[];
  onComplete: (data: Record<string, any>) => void;
  defaultValues?: Record<string, any>;
  tenantId: string;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  steps,
  onComplete,
  defaultValues = {},
  tenantId
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>(defaultValues);
  const navigate = useNavigate();
  
  const currentStep = steps[currentStepIndex];
  
  const handleNext = (stepData: Record<string, any> = {}) => {
    // Merge step data with overall form data
    const updatedFormData = { ...formData, ...stepData };
    setFormData(updatedFormData);
    
    if (currentStepIndex < steps.length - 1) {
      // Log step completion
      logSystemEvent(
        'onboarding',
        'info',
        {
          description: `Completed onboarding step ${currentStepIndex + 1}: ${currentStep.title}`,
          step: currentStepIndex + 1,
          step_id: currentStep.id
        },
        tenantId
      ).catch(console.error);
      
      // Move to next step
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Final step - complete onboarding
      handleComplete(updatedFormData);
    }
  };
  
  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };
  
  const handleComplete = async (finalData: Record<string, any>) => {
    try {
      // Log onboarding completion
      await logSystemEvent(
        'onboarding',
        'info',
        {
          description: 'Onboarding process completed',
          total_steps: steps.length
        },
        tenantId
      );
      
      // Call completion handler
      await onComplete(finalData);
      
      toast.success('Setup complete! Welcome aboard.');
      navigate('/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('There was an issue completing setup. Please try again.');
    }
  };
  
  useEffect(() => {
    // Log initial step view
    if (tenantId) {
      logSystemEvent(
        'onboarding',
        'info',
        {
          description: `Viewed onboarding step ${currentStepIndex + 1}: ${currentStep?.title}`,
          step: currentStepIndex + 1,
          step_id: currentStep?.id
        },
        tenantId
      ).catch(console.error);
    }
  }, [currentStepIndex, currentStep, tenantId]);
  
  return (
    <div className="max-w-4xl mx-auto">
      <Steps
        currentStep={currentStepIndex + 1}
        totalSteps={steps.length}
        labels={steps.map(step => step.title)}
        className="mb-8"
      />
      
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{currentStep.title}</CardTitle>
          <CardDescription>{currentStep.description}</CardDescription>
        </CardHeader>
        
        <CardContent>
          {currentStep.component}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            Back
          </Button>
          
          <Button
            onClick={() => handleNext()}
            disabled={currentStepIndex === steps.length}
          >
            {currentStepIndex < steps.length - 1 ? 'Next' : 'Complete'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OnboardingWizard;
