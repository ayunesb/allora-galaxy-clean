
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { checkExistingTenants } from '@/lib/onboarding/tenantUtils';

export function useOnboardingTenants(currentUser: User | null) {
  const [tenantsList, setTenantsList] = useState<any[]>([]);
  
  // Check if user already has tenants
  useEffect(() => {
    if (currentUser?.id) {
      loadExistingTenants();
    }
  }, [currentUser]);
  
  // Load existing tenants for user
  const loadExistingTenants = async () => {
    if (!currentUser?.id) return;
    
    const tenantsData = await checkExistingTenants(currentUser.id);
    if (tenantsData && tenantsData.length > 0) {
      setTenantsList(tenantsData);
    }
  };

  return {
    tenantsList,
    hasTenants: tenantsList.length > 0,
    loadExistingTenants
  };
}
