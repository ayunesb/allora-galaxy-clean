
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { OnboardingFormData } from '@/types/onboarding';
import { useOnboardingSubmission as useOnboardingMutation } from '@/services/onboardingService';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const useOnboardingSubmission = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onboardingMutation = useOnboardingMutation();
  
  const submitOnboardingData = async (data: OnboardingFormData) => {
    if (!user) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to complete onboarding.',
        variant: 'destructive',
      });
      return false;
    }
    
    setIsSubmitting(true);
    
    try {
      // Add user ID to the form data
      const formDataWithUser = {
        ...data,
        userId: user.id
      };
      
      // Submit onboarding data
      const result = await onboardingMutation.mutateAsync(formDataWithUser);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Show success toast
      toast({
        title: 'Onboarding Complete',
        description: 'Your workspace has been created successfully.',
      });
      
      // Redirect to dashboard
      navigate('/dashboard');
      return result.tenantId;
    } catch (error: any) {
      console.error('Onboarding submission error:', error);
      toast({
        title: 'Onboarding Failed',
        description: error.message || 'There was an error processing your onboarding information.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    submitOnboardingData,
    isSubmitting: isSubmitting || onboardingMutation.isPending,
    error: onboardingMutation.error
  };
};

export default useOnboardingSubmission;
