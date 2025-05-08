
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to handle onboarding redirection logic
 * @returns Object with shouldRedirectToOnboarding and loading states
 */
export const useOnboardingRedirect = () => {
  const navigate = useNavigate();
  const [shouldRedirectToOnboarding, setShouldRedirectToOnboarding] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }
        
        // Check if user has any tenants
        const { data: tenants, error } = await supabase
          .from('tenant_user_roles')
          .select('tenant_id')
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error checking tenants:', error);
          setLoading(false);
          return;
        }
        
        // If user has no tenants, they need to complete onboarding
        if (!tenants || tenants.length === 0) {
          setShouldRedirectToOnboarding(true);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error in onboarding redirect check:', err);
        setLoading(false);
      }
    };
    
    checkOnboardingStatus();
  }, []);
  
  return { shouldRedirectToOnboarding, loading };
};
