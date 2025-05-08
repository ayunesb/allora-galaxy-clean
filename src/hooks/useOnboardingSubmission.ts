
import { useState } from 'react';
import { OnboardingFormData, GenerateStrategyResult } from '@/types/onboarding';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { sendNotification } from '@/lib/notifications/sendNotification';

export function useOnboardingSubmission(generateStrategy: (data: OnboardingFormData) => Promise<GenerateStrategyResult>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (formData: OnboardingFormData) => {
    if (!user) {
      setError('User must be logged in to complete onboarding');
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to complete onboarding',
        variant: 'destructive'
      });
      return false;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      // Generate strategy
      const result = await generateStrategy(formData);
      
      if (result.success) {
        // Send notification
        await sendNotification({
          title: 'Welcome to Allora OS',
          description: 'Your workspace is ready! We\'ve created your initial strategy.',
          type: 'success',
          tenant_id: result.tenantId || '',
          user_id: user.id || '',
          action_label: 'View Dashboard',
          action_url: '/dashboard'
        });
        
        toast({
          title: 'Welcome to Allora OS!',
          description: 'Your workspace has been created successfully.',
        });
        
        return true;
      } else {
        setError(result.error || 'Failed to create workspace');
        toast({
          title: 'Error',
          description: result.error || 'Failed to create workspace',
          variant: 'destructive',
        });
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      toast({
        title: 'Error',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      console.error('Onboarding error:', err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetError = () => {
    setError(null);
  };

  return {
    isSubmitting,
    error,
    handleSubmit,
    resetError
  };
}
