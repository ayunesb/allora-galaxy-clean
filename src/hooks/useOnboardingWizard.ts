
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useStrategyGeneration } from '@/hooks/useStrategyGeneration';
import { OnboardingStep } from '@/types/shared';
import { OnboardingFormData } from '@/types/onboarding';

export function useOnboardingWizard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isGenerating, generateStrategy } = useStrategyGeneration();

  // Current step in the onboarding process
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  
  // Form data state
  const [formData, setFormData] = useState<OnboardingFormData>({
    companyInfo: {
      name: '',
      industry: '',
      size: '',
    },
    persona: {
      name: '',
      goals: [],
      tone: 'professional',
    },
    additionalInfo: {
      targetAudience: '',
      keyCompetitors: '',
      uniqueSellingPoints: '',
    }
  });

  // Handle form data updates
  const updateFormData = (
    section: keyof OnboardingFormData,
    data: Partial<OnboardingFormData[keyof OnboardingFormData]>
  ) => {
    setFormData(prevData => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        ...data
      }
    }));
  };

  // Progress to the next step
  const nextStep = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('company_info');
        break;
      case 'company_info':
        setCurrentStep('persona');
        break;
      case 'persona':
        setCurrentStep('additional_info');
        break;
      case 'additional_info':
        setCurrentStep('strategy_generation');
        break;
      case 'strategy_generation':
        setCurrentStep('complete');
        break;
      case 'complete':
        navigate('/dashboard');
        break;
    }
  };

  // Go back to previous step
  const prevStep = () => {
    switch (currentStep) {
      case 'company_info':
        setCurrentStep('welcome');
        break;
      case 'persona':
        setCurrentStep('company_info');
        break;
      case 'additional_info':
        setCurrentStep('persona');
        break;
      case 'strategy_generation':
        setCurrentStep('additional_info');
        break;
      case 'complete':
        setCurrentStep('strategy_generation');
        break;
    }
  };

  // Submit onboarding data and generate initial strategy
  const handleSubmit = async () => {
    try {
      const result = await generateStrategy(formData);
      
      if (result.success) {
        toast({
          title: 'Onboarding complete!',
          description: 'Your strategy has been generated successfully',
        });
        nextStep();
        navigate('/dashboard');
      } else {
        toast({
          title: 'Onboarding failed',
          description: result.error || 'Something went wrong',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete onboarding',
        variant: 'destructive',
      });
    }
  };

  return {
    currentStep,
    formData,
    isGenerating,
    updateFormData,
    nextStep,
    prevStep,
    handleSubmit,
  };
}
