
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { OnboardingFormData } from '@/types/onboarding/types';
import { toast } from '@/hooks/use-toast';
import { completeOnboarding } from '@/services/onboardingService';

export type OnboardingStep = 
  | 'welcome' 
  | 'company-info' 
  | 'persona' 
  | 'additional-info' 
  | 'strategy-generation';

export function useOnboardingWizard() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [formData, setFormData] = useState<OnboardingFormData>({
    companyName: '',
    industry: '',
    companyDescription: '',
    personaName: '',
    tone: 'professional',
    goals: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Step configuration
  const steps: OnboardingStep[] = [
    'welcome',
    'company-info',
    'persona',
    'additional-info',
    'strategy-generation'
  ];
  
  // Calculate progress percentage
  const calculateProgress = () => {
    const currentIndex = steps.indexOf(currentStep);
    return Math.round((currentIndex / (steps.length - 1)) * 100);
  };
  
  // Navigate to next step
  const nextStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
      setProgress(calculateProgress());
    }
  };
  
  // Navigate to previous step
  const prevStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
      setProgress(calculateProgress());
    }
  };
  
  // Go to specific step
  const goToStep = (step: OnboardingStep) => {
    if (steps.includes(step)) {
      setCurrentStep(step);
      setProgress(calculateProgress());
    }
  };
  
  // Update form data
  const updateFormData = (data: Partial<OnboardingFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };
  
  // Handle welcome step
  const handleWelcomeSubmit = () => {
    nextStep();
  };
  
  // Handle company info submission
  const handleCompanyInfoSubmit = (data: Partial<OnboardingFormData>) => {
    updateFormData(data);
    nextStep();
  };
  
  // Handle persona submission
  const handlePersonaSubmit = (data: Partial<OnboardingFormData>) => {
    updateFormData(data);
    nextStep();
  };
  
  // Handle additional info submission
  const handleAdditionalInfoSubmit = (data: Partial<OnboardingFormData>) => {
    updateFormData(data);
    nextStep();
  };
  
  // Complete the onboarding process
  const completeOnboardingProcess = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to complete the onboarding process.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await completeOnboarding(user.id, formData);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to complete onboarding");
      }
      
      toast({
        title: "Onboarding completed!",
        description: "Your workspace has been set up successfully.",
      });
      
      // Navigate to dashboard with the new tenant
      if (result.tenantId) {
        navigate(`/dashboard?tenant=${result.tenantId}`);
      } else {
        navigate('/dashboard');
      }
      
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast({
        title: "Onboarding failed",
        description: error.message || "There was an error during the onboarding process.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentStep,
    formData,
    progress,
    isLoading,
    nextStep,
    prevStep,
    goToStep,
    updateFormData,
    handleWelcomeSubmit,
    handleCompanyInfoSubmit,
    handlePersonaSubmit,
    handleAdditionalInfoSubmit,
    completeOnboardingProcess,
  };
}
