
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { OnboardingFormData } from '@/types/onboarding';
import { submitOnboardingData } from '@/services/onboardingService';
import { useOnboardingSteps } from '@/hooks/useOnboardingSteps';

export type { OnboardingFormData } from '@/types/onboarding';

export const useOnboardingWizard = () => {
  const { user } = useAuth();
  const { tenants, setCurrentTenant } = useWorkspace();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data state
  const [formData, setFormData] = useState<OnboardingFormData>({
    companyName: '',
    industry: '',
    teamSize: '',
    revenueRange: '',
    website: '',
    description: '',
    personaName: '',
    tone: '',
    goals: '',
  });

  // Use our dedicated steps hook
  const { 
    currentStep, 
    handleNextStep, 
    handlePrevStep, 
    handleStepClick, 
    isStepValid 
  } = useOnboardingSteps(formData);

  // Update form data
  const updateFormData = (key: keyof OnboardingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Handle onboarding submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (!user) {
        throw new Error("User is not authenticated");
      }

      const result = await submitOnboardingData(formData, user.id);

      if (!result.success) {
        throw new Error(result.error || "Failed to complete onboarding");
      }

      toast({
        title: 'Onboarding complete!',
        description: 'Your workspace has been set up successfully.',
      });

      // Set the current tenant and redirect to dashboard
      if (result.tenantId) {
        setCurrentTenant({
          id: result.tenantId,
          name: formData.companyName,
          role: 'owner'
        });
      }
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('Onboarding error:', error);
      setError(error.message || 'An unexpected error occurred during onboarding');
      
      toast({
        title: 'Onboarding failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetError = () => setError(null);

  return {
    currentStep,
    isSubmitting,
    error,
    formData,
    tenants,
    user,
    updateFormData,
    handleNextStep,
    handlePrevStep,
    handleStepClick,
    handleSubmit,
    isStepValid,
    resetError,
  };
};
