
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook to check if a user already has an available tenant
 */
export function useTenantAvailability() {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();
  
  useEffect(() => {
    async function checkTenantAvailability() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('tenant_user_roles')
          .select('tenant_id')
          .eq('user_id', user.id)
          .limit(1);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setTenantId(data[0].tenant_id);
          setIsAvailable(true);
        } else {
          setIsAvailable(false);
        }
      } catch (err) {
        console.error('Error checking tenant availability:', err);
        setIsAvailable(false);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkTenantAvailability();
  }, [user]);
  
  return { tenantId, isAvailable, isLoading };
}
