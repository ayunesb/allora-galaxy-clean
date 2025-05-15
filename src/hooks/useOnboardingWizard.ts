
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/lib/notifications/toast';

// Define the step interfaces and other types

export const useOnboardingWizard = (steps: string[], initialData = {}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { toast } = useToast();
  
  // Reset errors when changing steps
  useEffect(() => {
    setErrors({});
  }, [currentStep]);
  
  const updateFormData = useCallback((newData: Record<string, any>) => {
    setFormData(prevData => ({
      ...prevData,
      ...newData
    }));
  }, []);
  
  const validateStep = useCallback((stepIndex: number): boolean => {
    // This would contain step-specific validation logic
    // For now, we'll just return true
    return true;
  }, []);
  
  const nextStep = useCallback(() => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before continuing"
      });
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  }, [currentStep, steps, validateStep]);
  
  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);
  
  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStep(index);
    }
  }, [steps]);
  
  const completeOnboarding = useCallback(() => {
    // Here you would submit the completed form data
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setCompleted(true);
      toast({
        title: "Onboarding Complete",
        description: "Thank you for completing the onboarding process!"
      });
    }, 1500);
  }, []);
  
  const handleError = useCallback((error: Error) => {
    console.error('Onboarding error:', error);
    toast({
        title: "Error",
        description: error.message || "An unexpected error occurred"
    });
  }, []);
  
  return {
    currentStep,
    totalSteps: steps.length,
    formData,
    updateFormData,
    nextStep,
    prevStep,
    goToStep,
    loading,
    completed,
    errors,
    setErrors,
    handleError,
    stepName: steps[currentStep],
    isLastStep: currentStep === steps.length - 1,
    isFirstStep: currentStep === 0,
    progress: ((currentStep + 1) / steps.length) * 100
  };
};
