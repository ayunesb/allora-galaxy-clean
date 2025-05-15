
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export interface OnboardingWizardState {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
}

export const useOnboardingWizard = (totalSteps: number, submitCallback: () => Promise<void>, redirectPath?: string) => {
  const [state, setState] = useState<OnboardingWizardState>({
    currentStep: 1,
    totalSteps,
    isSubmitting: false,
  });
  
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const nextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, prev.totalSteps),
    }));
  }, []);
  
  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }));
  }, []);
  
  const goToStep = useCallback((step: number) => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(Math.max(step, 1), prev.totalSteps),
    }));
  }, []);
  
  const submitForm = useCallback(async () => {
    setState((prev) => ({ ...prev, isSubmitting: true }));
    setError(null);
    
    try {
      await submitCallback();
      
      toast({
        title: "Success",
        description: "Onboarding completed successfully!",
        variant: "default",
      });
      
      if (redirectPath) {
        navigate(redirectPath);
      }
    } catch (err: any) {
      console.error('Onboarding error:', err);
      setError(err.message || 'Something went wrong during onboarding');
      
      toast({
        title: "Error",
        description: err.message || 'Something went wrong during onboarding',
        variant: "destructive",
      });
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, [submitCallback, redirectPath, navigate, toast]);
  
  return {
    currentStep: state.currentStep,
    totalSteps: state.totalSteps,
    isSubmitting: state.isSubmitting,
    nextStep,
    prevStep,
    goToStep,
    submitForm,
    error,
  };
};

export default useOnboardingWizard;
