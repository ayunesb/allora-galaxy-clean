
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingSubmission } from './useOnboardingSubmission';
import { useWorkspace } from '@/context/WorkspaceContext';

// Step type for the onboarding wizard
export type OnboardingStep = 'company' | 'goals' | 'strategy' | 'complete';

export const useOnboardingWizard = () => {
  const [step, setStep] = useState<OnboardingStep>('company');
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    companySize: '',
    description: '',
    goals: [] as string[],
    strategy: {
      title: '',
      description: '',
    },
  });
  const { submitOnboardingData, isSubmitting } = useOnboardingSubmission();
  const navigate = useNavigate();

  // Move to the next step
  const nextStep = () => {
    if (step === 'company') setStep('goals');
    else if (step === 'goals') setStep('strategy');
    else if (step === 'strategy') setStep('complete');
  };

  // Move to the previous step
  const prevStep = () => {
    if (step === 'goals') setStep('company');
    else if (step === 'strategy') setStep('goals');
    else if (step === 'complete') setStep('strategy');
  };

  // Update form data
  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
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
    formData,
    isSubmitting,
    nextStep,
    prevStep,
    updateFormData,
    completeOnboarding,
  };
};
