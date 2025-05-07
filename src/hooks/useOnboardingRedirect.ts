
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook to handle onboarding redirection logic
 */
export const useOnboardingRedirect = (tenants: any[] | null | undefined) => {
  const navigate = useNavigate();
  
  // Check if we should redirect to dashboard if user already completed onboarding
  useEffect(() => {
    if (tenants && tenants.length > 0) {
      navigate('/dashboard');
    }
  }, [tenants, navigate]);
};
