
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { OnboardingFormData } from '@/types/onboarding';
import { submitOnboardingData } from '@/services/onboardingService';
import { useOnboardingSteps } from '@/hooks/useOnboardingSteps';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export type { OnboardingFormData } from '@/types/onboarding';

/**
 * Custom hook for handling the onboarding wizard flow
 */
export const useOnboardingWizard = () => {
  const { user } = useAuth();
  const { tenants, setCurrentTenant } = useWorkspace();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);

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
    isStepValid,
    validateCurrentStep 
  } = useOnboardingSteps(formData);

  // Update form data
  const updateFormData = (key: keyof OnboardingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Generate AI strategy based on company and persona data
  const generateAIStrategy = async (tenantId: string, userId: string) => {
    setIsGeneratingStrategy(true);
    
    try {
      // Prepare data for the AI
      const companyProfile = {
        name: formData.companyName,
        industry: formData.industry,
        size: formData.teamSize,
        revenue_range: formData.revenueRange,
        website: formData.website,
        description: formData.description
      };
      
      const personaProfile = {
        name: formData.personaName,
        tone: formData.tone,
        goals: formData.goals.split(',').map(goal => goal.trim())
      };
      
      // Call the edge function to generate a strategy
      const { data, error } = await supabase.functions.invoke('generateStrategy', {
        body: {
          tenant_id: tenantId,
          company_profile: companyProfile,
          persona_profile: personaProfile,
          user_id: userId
        }
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to generate strategy');
      }
      
      toast({
        title: 'Strategy generated!',
        description: 'Your AI-powered strategy is ready to review.',
      });
      
      // Log successful generation
      await logSystemEvent(
        tenantId,
        'strategy',
        'strategy_generated_onboarding',
        { strategy_id: data.strategy?.id }
      );
      
      return data.strategy;
    } catch (error: any) {
      console.error('Strategy generation error:', error);
      toast({
        title: 'Strategy generation failed',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsGeneratingStrategy(false);
    }
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

      // Set the current tenant
      if (result.tenantId) {
        setCurrentTenant({
          id: result.tenantId,
          name: formData.companyName,
        });
        
        // Log successful completion
        await logSystemEvent(
          result.tenantId,
          'onboarding',
          'onboarding_completed',
          { tenant_id: result.tenantId }
        );
        
        // Generate AI strategy
        await generateAIStrategy(result.tenantId, user.id);
        
        // Redirect to dashboard
        navigate('/dashboard');
      }
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
    validateCurrentStep,
    isGeneratingStrategy
  };
};
