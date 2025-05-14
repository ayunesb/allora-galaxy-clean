
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useStrategyGeneration } from '@/hooks/useStrategyGeneration';
import { OnboardingStep, OnboardingFormData } from '@/types/onboarding';

export function useOnboardingWizard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isGenerating, generateStrategy } = useStrategyGeneration();

  // Current step in the onboarding process
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  
  // Form data state with required fields initialized
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
  const updateFormData = (data: Partial<OnboardingFormData>) => {
    setFormData(prevData => ({
      ...prevData,
      ...data,
      // Ensure nested objects are properly merged
      companyInfo: {
        ...prevData.companyInfo,
        ...(data.companyInfo || {})
      },
      persona: {
        ...prevData.persona,
        ...(data.persona || {})
      },
      additionalInfo: {
        ...prevData.additionalInfo,
        ...(data.additionalInfo || {})
      }
    }));
  };

  // Progress to the next step
  const nextStep = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('company-info');
        break;
      case 'company-info':
        setCurrentStep('persona');
        break;
      case 'persona':
        setCurrentStep('additional-info');
        break;
      case 'additional-info':
        setCurrentStep('strategy-generation');
        break;
      case 'strategy-generation':
        setCurrentStep('completed');
        break;
      case 'completed':
        navigate('/dashboard');
        break;
    }
  };

  // Go back to previous step
  const prevStep = () => {
    switch (currentStep) {
      case 'company-info':
        setCurrentStep('welcome');
        break;
      case 'persona':
        setCurrentStep('company-info');
        break;
      case 'additional-info':
        setCurrentStep('persona');
        break;
      case 'strategy-generation':
        setCurrentStep('additional-info');
        break;
      case 'completed':
        setCurrentStep('strategy-generation');
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
