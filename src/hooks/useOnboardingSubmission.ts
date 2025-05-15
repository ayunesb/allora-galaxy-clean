
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useOnboardingSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitOnboardingData = async (data: any) => {
    setIsSubmitting(true);
    setSuccess(false);
    setError(null);

    try {
      // Validate the data before submission (simplified example)
      if (!data || !data.tenant_name) {
        throw new Error('Required fields are missing');
      }
      
      // Submit to Supabase
      const { error: submissionError } = await supabase
        .from('onboarding_submissions')
        .insert({
          data: data,
        });

      if (submissionError) {
        throw submissionError;
      }

      toast({
        description: 'Onboarding data submitted successfully',
      });
      
      setSuccess(true);
      
      // Optionally create tenant directly
      if (data.create_tenant_immediately) {
        const { error: tenantError } = await supabase
          .rpc('create_tenant_from_onboarding', { 
            onboarding_data: data 
          });
          
        if (tenantError) {
          toast({
            variant: "destructive",
            description: `Tenant created but setup failed: ${tenantError.message}`,
          });
        } else {
          toast({
            description: 'Tenant created successfully',
          });
        }
      }
      
      return { success: true };
    } catch (err: any) {
      console.error('Onboarding submission error:', err);
      const errorMessage = err.message || 'Failed to submit onboarding data';
      
      toast({
        variant: "destructive",
        description: errorMessage,
      });
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitOnboardingData,
    isSubmitting,
    success,
    error
  };
};

export default useOnboardingSubmission;
