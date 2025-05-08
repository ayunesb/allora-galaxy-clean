
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { OnboardingFormData } from '@/types/onboarding';
import { v4 as uuidv4 } from 'uuid';
import { sendNotification } from '@/lib/notifications/sendNotification';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

export const useStrategyGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();
  
  /**
   * Generate an initial strategy based on onboarding data
   */
  const generateStrategy = async (formData: OnboardingFormData) => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    setIsGenerating(true);
    
    try {
      // Step 1: Create the tenant
      const tenantId = uuidv4();
      const tenantSlug = formData.companyName
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
        
      const { error: tenantError } = await supabase
        .from('tenants')
        .insert({
          id: tenantId,
          name: formData.companyName,
          slug: `${tenantSlug}-${tenantId.slice(0, 8)}`,
          owner_id: user.id,
        });
        
      if (tenantError) {
        throw new Error(`Failed to create tenant: ${tenantError.message}`);
      }
        
      // Step 2: Add user as owner in tenant_user_roles
      const { error: roleError } = await supabase
        .from('tenant_user_roles')
        .insert({
          tenant_id: tenantId,
          user_id: user.id,
          role: 'owner'
        });
        
      if (roleError) {
        throw new Error(`Failed to set user role: ${roleError.message}`);
      }
        
      // Step 3: Create company profile
      const { error: profileError } = await supabase
        .from('company_profiles')
        .insert({
          tenant_id: tenantId,
          name: formData.companyName,
          industry: formData.industry,
          size: formData.companySize,
          revenue_range: formData.revenueRange,
          website: formData.website,
        });
        
      if (profileError) {
        throw new Error(`Failed to create company profile: ${profileError.message}`);
      }
        
      // Step 4: Create persona
      const { error: personaError } = await supabase
        .from('persona_profiles')
        .insert({
          tenant_id: tenantId,
          name: formData.persona.name,
          goals: formData.persona.goals,
          tone: formData.persona.tone
        });
        
      if (personaError) {
        throw new Error(`Failed to create persona: ${personaError.message}`);
      }
      
      // Step 5: Create initial strategy
      const { error: strategyError } = await supabase
        .from('strategies')
        .insert({
          tenant_id: tenantId,
          title: `${formData.companyName} Initial Strategy`,
          description: `Auto-generated strategy for ${formData.companyName} targeting ${formData.persona.name}`,
          status: 'pending',
          created_by: user.id,
          priority: 'high',
          tags: ['initial', 'onboarding', formData.industry.toLowerCase()]
        });
        
      if (strategyError) {
        throw new Error(`Failed to create strategy: ${strategyError.message}`);
      }
      
      // Step 6: Mark onboarding completed
      const { error: onboardingError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);
        
      if (onboardingError) {
        console.error('Failed to update onboarding status:', onboardingError);
        // Non-critical error, continue
      }
      
      // Notify user of successful setup
      await sendNotification({
        title: 'Workspace Created',
        description: 'Your Allora OS workspace has been successfully created.',
        type: 'success',
        tenant_id: tenantId,
        user_id: user.id,
        action_url: '/dashboard',
        action_label: 'Go to Dashboard'
      });
      
      // Log the event
      await logSystemEvent(
        tenantId,
        'onboarding',
        'workspace_created',
        {
          company_name: formData.companyName,
          industry: formData.industry
        }
      );
      
      return {
        success: true,
        tenantId
      };
    } catch (error: any) {
      console.error('Strategy generation error:', error);
      
      // Log the error
      await logSystemEvent(
        'system',
        'onboarding',
        'workspace_creation_failed',
        {
          error: error.message,
          company_name: formData.companyName
        }
      );
      
      return {
        success: false,
        error: error.message || 'Failed to generate strategy'
      };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateStrategy
  };
};
