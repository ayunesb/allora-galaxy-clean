
import { useState } from 'react';
import { useToast } from '@/lib/notifications/toast';
import { supabase } from '@/integrations/supabase/client';

export const useOnboardingSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const submitOnboardingData = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    setSuccess(false);
    
    try {
      // Validate input
      if (!data.tenant_id) {
        toast({
          title: "Missing Information",
          description: "Tenant ID is required to complete onboarding"
        });
        return { success: false, error: "Missing tenant_id" };
      }
      
      // Mock onboarding submission to Supabase
      // First update the company profile
      if (data.company) {
        const { error: companyError } = await supabase
          .from('company_profiles')
          .upsert({
            tenant_id: data.tenant_id,
            name: data.company.name,
            industry: data.company.industry,
            size: data.company.size,
            description: data.company.description
          });
        
        if (companyError) {
          throw companyError;
        }
      }
      
      // Set onboarding as completed in user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', data.user_id);
      
      if (profileError) {
        throw profileError;
      }
      
      // Create initial strategy if provided
      if (data.strategy) {
        const { error: strategyError } = await supabase
          .from('strategies')
          .insert({
            tenant_id: data.tenant_id,
            title: data.strategy.title,
            description: data.strategy.description,
            status: 'draft',
            created_by: data.user_id
          });
        
        if (strategyError) {
          throw strategyError;
        }
      }
      
      setSuccess(true);
      toast({
        title: "Onboarding Complete",
        description: "Your account setup has been completed successfully!"
      });
      
      return { success: true };
    } catch (error: any) {
      console.error("Onboarding submission error:", error);
      
      toast({
        title: "Onboarding Error",
        description: error.message || "Failed to complete onboarding process"
      });
      
      return { 
        success: false, 
        error: error.message || "Unknown error occurred" 
      };
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    isSubmitting,
    success,
    submitOnboardingData
  };
};
