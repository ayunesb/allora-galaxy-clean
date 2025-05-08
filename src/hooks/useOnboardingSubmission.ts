
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { notifyAndLog } from '@/lib/notifications/notifyAndLog';
import { useAuth } from '@/context/AuthContext';

interface OnboardingDataType {
  companyName: string;
  industry: string;
  companySize: string;
  description: string;
  goals: string[];
  strategy: {
    title: string;
    description: string;
  };
}

interface OnboardingSubmissionResult {
  success: boolean;
  error?: Error;
  tenantId?: string;
}

export const useOnboardingSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const submitOnboardingData = async (data: OnboardingDataType): Promise<OnboardingSubmissionResult> => {
    if (!user) {
      return { success: false, error: new Error('User not authenticated') };
    }

    setIsSubmitting(true);

    try {
      // Create a new tenant
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: data.companyName,
          slug: data.companyName.toLowerCase().replace(/\s+/g, '-'),
          owner_id: user.id,
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      const tenantId = tenantData.id;

      // Add user to tenant with owner role
      const { error: roleError } = await supabase
        .from('tenant_user_roles')
        .insert({
          tenant_id: tenantId,
          user_id: user.id,
          role: 'owner',
        });

      if (roleError) throw roleError;

      // Create company profile
      const { error: companyError } = await supabase
        .from('company_profiles')
        .insert({
          tenant_id: tenantId,
          name: data.companyName,
          industry: data.industry,
          size: data.companySize,
          description: data.description,
        });

      if (companyError) throw companyError;

      // Create persona profile
      const { error: personaError } = await supabase
        .from('persona_profiles')
        .insert({
          tenant_id: tenantId,
          name: 'Default Persona',
          goals: data.goals,
          tone: 'Professional',
        });

      if (personaError) throw personaError;

      // Create initial strategy
      const { data: strategyData, error: strategyError } = await supabase
        .from('strategies')
        .insert({
          tenant_id: tenantId,
          title: data.strategy.title,
          description: data.strategy.description,
          status: 'pending',
          created_by: user.id,
        })
        .select()
        .single();

      if (strategyError) throw strategyError;

      // Create notification for completed onboarding
      await notifyAndLog({
        tenant_id: tenantId,
        user_id: user.id,
        title: 'Onboarding completed',
        description: 'Your account has been set up successfully.',
        type: 'success',
        module: 'onboarding',
      });

      return { success: true, tenantId };
    } catch (error) {
      console.error('Error in submitOnboardingData:', error);
      return { success: false, error: error as Error };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitOnboardingData, isSubmitting };
};
