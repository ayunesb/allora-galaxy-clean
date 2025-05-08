
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/context/WorkspaceContext';
import { sendNotification } from '@/lib/notifications/sendNotification';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { notifySuccess, notifyError } from '@/components/ui/BetterToast';
import { useAuth } from '@/context/AuthContext';

export const useOnboardingSubmission = () => {
  const { user } = useAuth();
  const { currentTenant } = useWorkspace();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitOnboardingData = async (formData: any) => {
    if (!currentTenant || !user) {
      notifyError('Error', 'No active workspace or user session');
      return { success: false };
    }
    
    setIsSubmitting(true);
    
    try {
      // Update company profile with onboarding data
      const { error: updateError } = await supabase
        .from('company_profiles')
        .upsert({
          tenant_id: currentTenant.id,
          name: formData.companyName || currentTenant.name,
          industry: formData.industry,
          size: formData.companySize,
          goals: formData.goals,
          description: formData.description
        });
        
      if (updateError) {
        throw new Error(`Failed to update company profile: ${updateError.message}`);
      }
      
      // Log event
      await logSystemEvent(
        currentTenant.id,
        'onboarding',
        'onboarding_completed',
        { user_id: user.id }
      );
      
      // Send notification
      await sendNotification({
        tenant_id: currentTenant.id,
        user_id: user.id,
        title: 'Onboarding Complete',
        description: 'Your workspace is now set up and ready to use.',
        type: 'success',
        action_url: '/dashboard',
        action_label: 'Go to Dashboard'
      });
      
      notifySuccess('Onboarding complete', 'Your workspace is now set up');
      return { success: true };
      
    } catch (error: any) {
      console.error('Onboarding submission error:', error);
      notifyError('Submission failed', error.message);
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    isSubmitting,
    submitOnboardingData
  };
};
