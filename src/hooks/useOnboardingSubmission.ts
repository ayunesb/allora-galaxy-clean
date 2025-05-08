
// Fix unused variable 'strategyData'
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { OnboardingFormData } from '@/types/onboarding';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { useToast } from '@/hooks/use-toast';

export function useOnboardingSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const submitOnboardingData = async (formData: OnboardingFormData) => {
    if (!user) {
      setError('User must be logged in to complete onboarding');
      return { success: false, error: 'User not authenticated' };
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Create tenant for the user
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: formData.companyName,
          slug: generateSlug(formData.companyName),
          owner_id: user.id,
          metadata: {
            onboarding_completed: true,
            onboarding_date: new Date().toISOString(),
          },
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // 2. Add user as owner in tenant_user_roles
      const { error: roleError } = await supabase
        .from('tenant_user_roles')
        .insert({
          tenant_id: tenant.id,
          user_id: user.id,
          role: 'owner',
        });

      if (roleError) throw roleError;

      // 3. Create company profile
      const { error: companyError } = await supabase
        .from('company_profiles')
        .insert({
          tenant_id: tenant.id,
          name: formData.companyName,
          industry: formData.industry,
          size: formData.companySize,
          website: formData.website,
          revenue_range: formData.revenueRange,
          description: formData.description,
        });

      if (companyError) throw companyError;

      // 4. Create persona profile
      const { error: personaError } = await supabase
        .from('persona_profiles')
        .insert({
          tenant_id: tenant.id,
          name: formData.persona.name,
          goals: formData.persona.goals,
          tone: formData.persona.tone,
        });

      if (personaError) throw personaError;

      // 5. Set user's onboarding_completed to true
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 6. Generate initial strategy (would typically call an AI service)
      const initialStrategy = {
        title: `${formData.industry} Growth Strategy for ${formData.companyName}`,
        description: `Initial automated strategy based on ${formData.persona.name} persona needs and ${formData.description}`,
        status: 'pending',
        tenant_id: tenant.id,
        created_by: user.id,
        tags: ['initial', formData.industry.toLowerCase()],
        priority: 'high',
      };

      // 7. Insert the initial strategy
      const { data: strategy, error: strategyError } = await supabase
        .from('strategies')
        .insert(initialStrategy)
        .select();

      if (strategyError) throw strategyError;

      // Log the successful onboarding
      await logSystemEvent('system', 'onboarding', 'onboarding_completed', {
        tenant_id: tenant.id,
        company_name: formData.companyName,
        industry: formData.industry,
      });

      // Show success toast
      toast({
        title: 'Onboarding completed!',
        description: `Welcome to ${formData.companyName}'s workspace`,
      });

      return {
        success: true,
        tenantId: tenant.id,
        strategyId: strategy ? strategy[0]?.id : undefined,
      };
    } catch (err: any) {
      console.error('Onboarding submission error:', err);
      setError(err.message || 'Failed to complete onboarding');
      
      // Show error toast
      toast({
        title: 'Onboarding failed',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to generate a slug from company name
  const generateSlug = (companyName: string): string => {
    return companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 50);
  };

  return {
    submitOnboardingData,
    isSubmitting,
    error,
    setError,
  };
}
