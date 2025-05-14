import { useState, useEffect } from 'react';
import { useSupabase } from '@/providers/SupabaseProvider';

export type UseTenantIdResult = string | null;

export function useTenantId(): UseTenantIdResult {
  const { supabase } = useSupabase();
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    // Get current tenant ID from localStorage if available
    const storedTenantId = localStorage.getItem('tenantId');
    if (storedTenantId) {
      setTenantId(storedTenantId);
      return;
    }

    // Otherwise, try to get it from the authenticated user's profile
    const getUserTenant = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.id) {
        // Try to get the user's tenant from the profiles table
        const { data } = await supabase
          .from('profiles')
          .select('tenant_id')
          .eq('id', session.user.id)
          .single();
        
        if (data?.tenant_id) {
          setTenantId(data.tenant_id);
          localStorage.setItem('tenantId', data.tenant_id);
        } else {
          // Default to 'system' if no tenant is found
          setTenantId('system');
        }
      } else {
        setTenantId('system');
      }
    };
    
    getUserTenant().catch(console.error);
  }, [supabase]);

  return tenantId;
}

export default useTenantId;
