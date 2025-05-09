
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/shared';

/**
 * Hook to get the current user's role within the active tenant
 */
export function useTenantRole() {
  const { user } = useAuth();
  const tenantId = useTenantId();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user || !tenantId) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('tenant_user_roles')
          .select('role')
          .eq('tenant_id', tenantId)
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching tenant role:', error);
          setRole(null);
        } else {
          setRole(data?.role as UserRole);
        }
      } catch (err) {
        console.error('Error in useTenantRole hook:', err);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user, tenantId]);

  return { role, loading };
}
