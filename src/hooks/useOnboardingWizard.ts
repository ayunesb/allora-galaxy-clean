
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingSubmission } from './useOnboardingSubmission';
import { useWorkspace } from '@/context/WorkspaceContext';

// Step type for the onboarding wizard
export type OnboardingStep = 'company' | 'goals' | 'strategy' | 'complete';

// Form data type for onboarding
export interface OnboardingFormData {
  companyName: string;
  industry: string;
  companySize: string;
  description: string;
  goals: string[];
  strategy: {
    title: string;
    description: string;
  };
}

export const useOnboardingWizard = () => {
  const [step, setStep] = useState<OnboardingStep>('company');
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingFormData>({
    companyName: '',
    industry: '',
    companySize: '',
    description: '',
    goals: [],
    strategy: {
      title: '',
      description: '',
    },
  });
  const [error, setError] = useState<string | null>(null);
  const { submitOnboardingData, isSubmitting } = useOnboardingSubmission();
  const navigate = useNavigate();
  const { currentTenant } = useWorkspace();
  
  // Define steps for the wizard
  const steps = [
    { id: 'company', label: 'Company Info' },
    { id: 'goals', label: 'Goals' },
    { id: 'strategy', label: 'Strategy' },
    { id: 'complete', label: 'Complete' },
  ];

  // Move to the next step
  const handleNextStep = () => {
    const currentIndex = steps.findIndex(s => s.id === step);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(currentIndex + 1);
      setStep(steps[currentIndex + 1].id as OnboardingStep);
    }
  };

  // Move to the previous step
  const handlePrevStep = () => {
    const currentIndex = steps.findIndex(s => s.id === step);
    if (currentIndex > 0) {
      setCurrentStep(currentIndex - 1);
      setStep(steps[currentIndex - 1].id as OnboardingStep);
    }
  };

  // Jump to a specific step
  const handleStepClick = (stepId: OnboardingStep) => {
    setStep(stepId);
    setCurrentStep(steps.findIndex(s => s.id === stepId));
  };

  // Update form data
  const updateFormData = (data: Partial<OnboardingFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  // Set field values
  const setFieldValue = (key: string, value: any) => {
    setFormData(prev => {
      const keys = key.split('.');
      if (keys.length === 1) {
        return { ...prev, [key]: value };
      } else {
        const [parent, child] = keys;
        return {
          ...prev,
          [parent]: {
            ...(prev as any)[parent],
            [child]: value
          }
        };
      }
    });
  };

  // Validate the current step
  const validateCurrentStep = (): boolean => {
    if (step === 'company') {
      if (!formData.companyName) {
        setError('Company name is required');
        return false;
      }
    }
    else if (step === 'goals') {
      if (formData.goals.length === 0) {
        setError('At least one goal is required');
        return false;
      }
    }
    
    return true;
  };

  // Check if current step is valid
  const isStepValid = (): boolean => {
    switch (step) {
      case 'company':
        return !!formData.companyName;
      case 'goals':
        return formData.goals.length > 0;
      case 'strategy':
        return true;
      default:
        return true;
    }
  };

  // Reset any error
  const resetError = () => setError(null);

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      const result = await completeOnboarding();
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error?.message || 'Failed to complete onboarding');
      }
    } catch (error) {
      console.error('Error in onboarding submission:', error);
      setError((error as Error).message);
    }
  };

  // Complete the onboarding process
  const completeOnboarding = async () => {
    const result = await submitOnboardingData(formData);
    
    if (result.success) {
      // Navigate to dashboard after successful submission
      navigate('/dashboard');
    }
    
    return result;
  };

  return {
    step,
    currentStep,
    formData,
    steps,
    error,
    isSubmitting,
    isGeneratingStrategy: false,
    nextStep,
    prevStep: handlePrevStep,
    updateFormData,
    completeOnboarding,
    handleNextStep,
    handlePrevStep,
    handleStepClick,
    handleSubmit,
    isStepValid,
    resetError,
    validateCurrentStep,
    setFieldValue
  };
};
