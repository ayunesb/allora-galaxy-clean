
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { OnboardingFormData } from '@/types/onboarding/types';
import { completeOnboarding } from '@/services/onboardingService';

export function useOnboardingSubmission() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmission = async (formData: OnboardingFormData) => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "You need to be logged in to complete onboarding",
        variant: "destructive",
      });
      return { success: false };
    }

    setIsSubmitting(true);

    try {
      // Call onboarding service to handle the submission
      const result = await completeOnboarding(user.id, formData);

      if (!result.success) {
        throw new Error(result.error || "Failed to complete onboarding");
      }

      // Success!
      toast({
        title: "Onboarding completed!",
        description: "Your workspace is now ready to use.",
      });

      // Navigate to the dashboard with the new tenant ID
      if (result.tenantId) {
        navigate(`/dashboard?tenant=${result.tenantId}`);
      } else {
        navigate('/dashboard');
      }

      return { success: true, tenantId: result.tenantId };
    } catch (error: any) {
      console.error("Onboarding submission error:", error);
      
      toast({
        title: "Onboarding failed",
        description: error.message || "There was an error completing the onboarding process",
        variant: "destructive",
      });
      
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmission,
    isSubmitting,
  };
}
