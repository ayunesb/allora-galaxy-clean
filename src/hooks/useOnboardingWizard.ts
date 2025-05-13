
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { validateOnboardingData } from '@/lib/onboarding/validateOnboardingData';
import { completeOnboarding } from '@/services/onboardingService';
import { useOnboardingStore } from '@/lib/onboarding/onboardingState';
import { trackOnboardingStepCompleted, trackOnboardingStepView } from '@/lib/onboarding/onboardingAnalytics';
import { OnboardingStep } from '@/types/onboarding';

/**
 * Main hook for managing the onboarding wizard
 */
export function useOnboardingWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  
  // Get state from store
  const {
    currentStep,
    formData,
    isSubmitting,
    updateFormData,
    setField,
    setStep,
    nextStep,
    prevStep,
    setSubmitting,
    setComplete
  } = useOnboardingStore();
  
  // Define steps
  const steps = [
    { id: 'company-info' as OnboardingStep, label: 'Company Info' },
    { id: 'persona' as OnboardingStep, label: 'Target Persona' },
    { id: 'additional-info' as OnboardingStep, label: 'Additional Info' },
    { id: 'strategy-generation' as OnboardingStep, label: 'Strategy' },
  ];
  
  const step = steps[currentStep ?? 0];
  
  // Track step view
  const trackStepView = useCallback(() => {
    if (user) {
      trackOnboardingStepView(user.id, step.id);
    }
  }, [step?.id, user]);
  
  // Validate current step
  const validateCurrentStep = () => {
    const stepId = steps[currentStep ?? 0].id;
    const validation = validateOnboardingData(formData, stepId);
    
    if (!validation.valid) {
      // Show validation errors
      toast({
        title: "Validation Error",
        description: Object.values(validation.errors).join(', '),
        variant: "destructive"
      });
    }
    
    return validation;
  };
  
  // Check if current step is valid
  const isStepValid = () => {
    const stepId = steps[currentStep ?? 0].id;
    return validateOnboardingData(formData, stepId).valid;
  };
  
  // Handle step navigation
  const handleStepClick = (index: number) => {
    // Only allow going to completed steps or next step
    if (index <= (currentStep ?? 0) + 1) {
      setStep(index);
      trackStepView();
    }
  };
  
  // Handle next step
  const handleNextStep = () => {
    const validation = validateCurrentStep();
    
    if (!validation.valid) {
      return false;
    }
    
    if ((currentStep ?? 0) < steps.length - 1) {
      // Track step completion
      if (user) {
        trackOnboardingStepCompleted(user.id, steps[currentStep ?? 0].id);
      }
      
      nextStep();
      trackStepView();
      return true;
    }
    
    return false;
  };
  
  // Handle previous step
  const handlePrevStep = () => {
    if ((currentStep ?? 0) > 0) {
      prevStep();
      trackStepView();
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!user) {
      setError('User must be logged in to complete onboarding');
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to complete onboarding',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Complete the onboarding process
      const result = await completeOnboarding(user.id, formData);
      
      if (result.success && result.tenantId) {
        toast({
          title: 'Welcome to Allora OS!',
          description: 'Your workspace has been created successfully.',
        });
        
        // Mark onboarding as complete
        setComplete(true, result.tenantId);
        
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        setError(result.error || 'Failed to create workspace');
        toast({
          title: 'Error',
          description: result.error || 'Failed to create workspace',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      toast({
        title: 'Error',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      console.error('Onboarding error:', err);
    } finally {
      setSubmitting(false);
    }
  };
  
  const resetError = () => setError(null);
  
  // Initialize step tracking
  useState(() => {
    trackStepView();
  });
  
  return {
    steps,
    currentStep,
    step,
    formData,
    error,
    isSubmitting,
    updateFormData,
    setFieldValue: setField,
    handleStepClick,
    handleNextStep,
    handlePrevStep,
    handleSubmit,
    isStepValid,
    resetError,
    validateCurrentStep
  };
}
