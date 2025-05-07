
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { OnboardingFormData } from '@/types/onboarding';
import { submitOnboardingData } from '@/services/onboardingService';
import { createNotification } from '@/services/notificationService';
import { useNavigate } from 'react-router-dom';

/**
 * Hook for handling onboarding submission
 */
export const useOnboardingSubmission = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create welcome notification when tenant is created
   */
  const createWelcomeNotification = async (tenantId: string, userId: string) => {
    try {
      await createNotification({
        tenant_id: tenantId,
        user_id: userId,
        title: 'Welcome to Allora OS!',
        message: 'Your workspace has been set up successfully. Explore the dashboard to get started.',
        type: 'success',
        action_url: '/dashboard',
        action_label: 'Go to Dashboard'
      });
    } catch (error) {
      console.error("Error creating welcome notification:", error);
    }
  };

  /**
   * Handle onboarding submission
   */
  const handleSubmit = async (formData: OnboardingFormData, setCurrentTenant: (tenant: any) => void, onSuccess?: (tenantId: string) => Promise<void>) => {
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

      // Set the current tenant
      if (result.tenantId) {
        setCurrentTenant({
          id: result.tenantId,
          name: formData.companyName,
        });
        
        // Create welcome notification
        await createWelcomeNotification(result.tenantId, user.id);
        
        // Log successful completion
        await logSystemEvent(
          result.tenantId,
          'onboarding',
          'onboarding_completed',
          { tenant_id: result.tenantId }
        );
        
        // Call the success callback if provided
        if (onSuccess) {
          await onSuccess(result.tenantId);
        }
        
        // Redirect to dashboard after a delay to allow seeing the result
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
      
      return result.tenantId;
    } catch (error: any) {
      console.error('Onboarding error:', error);
      setError(error.message || 'An unexpected error occurred during onboarding');
      
      toast({
        title: 'Onboarding failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetError = () => setError(null);

  return {
    handleSubmit,
    isSubmitting,
    error,
    resetError,
    user
  };
};
