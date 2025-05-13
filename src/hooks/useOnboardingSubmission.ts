
import { useState } from 'react';
import { OnboardingData } from '@/types/onboarding/types';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import useAuth from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const useOnboardingSubmission = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitOnboarding = async (data: OnboardingData) => {
    if (!user) {
      setError('User not authenticated');
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to complete onboarding.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      // Create tenant record
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: data.companyName,
          owner_id: user.id,
          created_by: user.id,
          active: true
        })
        .select('id')
        .single();

      if (tenantError) {
        throw new Error(`Error creating tenant: ${tenantError.message}`);
      }

      const tenantId = tenantData.id;

      // Add user as owner of tenant
      const { error: roleError } = await supabase
        .from('tenant_user_roles')
        .insert({
          tenant_id: tenantId,
          user_id: user.id,
          role: 'owner',
          created_by: user.id,
        });

      if (roleError) {
        throw new Error(`Error assigning role: ${roleError.message}`);
      }

      // Create company profile
      const { error: profileError } = await supabase
        .from('company_profiles')
        .insert({
          tenant_id: tenantId,
          name: data.companyName,
          industry: data.industry,
          size: data.companySize,
          goals: data.goals,
          created_by: user.id,
        });

      if (profileError) {
        throw new Error(`Error creating profile: ${profileError.message}`);
      }

      // Mark onboarding as complete
      const { error: userError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      if (userError) {
        throw new Error(`Error updating profile: ${userError.message}`);
      }

      // Success, redirect to dashboard
      toast({
        title: 'Onboarding Complete',
        description: 'Your workspace is ready!',
      });

      navigate('/dashboard');
      return true;
    } catch (err: any) {
      console.error('Onboarding submission error:', err);
      setError(err.message);
      
      toast({
        title: 'Onboarding Error',
        description: err.message || 'An error occurred during onboarding.',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitOnboarding,
    loading,
    error,
  };
};

export default useOnboardingSubmission;
