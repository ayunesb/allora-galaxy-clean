
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/shared';

/**
 * Hook to get the user's role in a specific tenant
 * @param tenantId The tenant ID to check role for (optional, uses current tenant if not provided)
 * @returns The user's role in the tenant, loading state, and error state
 */
export function useTenantRole(tenantId?: string): { 
  role: UserRole | null;
  loading: boolean;
  error: Error | null;
} {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user || !tenantId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('tenant_user_roles')
          .select('role')
          .eq('tenant_id', tenantId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        
        setRole(data.role as UserRole);
      } catch (err) {
        console.error('Error fetching tenant role:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user, tenantId]);

  return { role, loading, error };
}

export default useTenantRole;
