
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';

export interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
}

export const useOnboardingWizard = (initialSteps: OnboardingStep[]) => {
  const [steps, setSteps] = useState<OnboardingStep[]>(initialSteps);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardingData, setOnboardingData] = useState<Record<string, any>>({});
  
  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const progress = Math.round(((currentStepIndex + 1) / totalSteps) * 100);
  
  const goToNextStep = () => {
    if (isLastStep) return;
    
    // Mark current step as completed
    setSteps(prev => 
      prev.map((step, idx) => 
        idx === currentStepIndex ? { ...step, isCompleted: true } : step
      )
    );
    
    setCurrentStepIndex(prev => prev + 1);
  };
  
  const goToPrevStep = () => {
    if (isFirstStep) return;
    setCurrentStepIndex(prev => prev - 1);
  };
  
  const goToStep = (index: number) => {
    if (index >= 0 && index < totalSteps) {
      setCurrentStepIndex(index);
    } else {
      toast({
        variant: "destructive",
        description: 'Invalid step index',
      });
    }
  };
  
  const updateOnboardingData = (data: Record<string, any>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };
  
  const resetOnboardingWizard = () => {
    setCurrentStepIndex(0);
    setSteps(initialSteps);
    setOnboardingData({});
  };
  
  const completeOnboarding = async (submitFn?: (data: Record<string, any>) => Promise<any>) => {
    setIsSubmitting(true);
    
    try {
      // Mark all steps as completed
      setSteps(prev => prev.map(step => ({ ...step, isCompleted: true })));
      
      // If a submission function is provided, call it with the onboarding data
      if (submitFn) {
        await submitFn(onboardingData);
      }
      
      toast({
        description: 'Onboarding completed successfully!',
      });
      
      return { success: true, data: onboardingData };
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message || 'Failed to complete onboarding',
      });
      
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    steps,
    currentStep,
    currentStepIndex,
    isFirstStep,
    isLastStep,
    isSubmitting,
    progress,
    onboardingData,
    goToNextStep,
    goToPrevStep,
    goToStep,
    updateOnboardingData,
    resetOnboardingWizard,
    completeOnboarding,
  };
};

export default useOnboardingWizard;
