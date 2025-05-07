
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

export type OnboardingFormData = {
  // Company profile data
  companyName: string;
  industry: string;
  teamSize: string;
  revenueRange: string;
  website: string;
  description: string;

  // Persona profile data
  personaName: string;
  tone: string;
  goals: string;
};

export const useOnboardingWizard = () => {
  const { user } = useAuth();
  const { createTenant, tenants } = useWorkspace();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
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

  // Update form data
  const updateFormData = (key: keyof OnboardingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  // Define step validation
  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.companyName && formData.industry && formData.teamSize && formData.revenueRange;
      case 1:
        return true; // Additional info is optional
      case 2:
        return formData.personaName && formData.tone && formData.goals;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Create new tenant
      const { data: tenant, error: tenantError } = await supabase.retryOperation(async () => {
        return await createTenant(formData.companyName);
      });

      if (tenantError) throw tenantError;
      if (!tenant) throw new Error("Failed to create tenant: No data returned");

      // Create company profile
      const { error: companyError } = await supabase.retryOperation(async () => {
        return await supabase
          .from('company_profiles')
          .insert({
            tenant_id: tenant.id,
            name: formData.companyName,
            industry: formData.industry,
            size: formData.teamSize,
            revenue_range: formData.revenueRange,
            website: formData.website,
            description: formData.description,
          });
      });

      if (companyError) throw companyError;

      // Create persona profile
      const { error: personaError } = await supabase.retryOperation(async () => {
        return await supabase
          .from('persona_profiles')
          .insert({
            tenant_id: tenant.id,
            name: formData.personaName,
            tone: formData.tone,
            goals: formData.goals.split('\n').filter(goal => goal.trim() !== ''),
          });
      });

      if (personaError) throw personaError;

      // Log successful onboarding
      await logSystemEvent(
        tenant.id,
        'onboarding',
        'onboarding_complete',
        {
          user_id: user?.id,
          company_name: formData.companyName,
          industry: formData.industry
        }
      );

      toast({
        title: 'Onboarding complete!',
        description: 'Your workspace has been set up successfully.',
      });

      // Redirect to dashboard
      window.location.href = '/';

    } catch (error: any) {
      console.error('Onboarding error:', error);
      setError(error.message || 'An unexpected error occurred during onboarding');
      
      toast({
        title: 'Onboarding failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
      
      try {
        await logSystemEvent(
          'system',
          'onboarding',
          'onboarding_failed',
          {
            user_id: user?.id,
            company_name: formData.companyName,
            error: error.message
          }
        );
      } catch (logError) {
        console.error("Failed to log onboarding error:", logError);
      }
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
