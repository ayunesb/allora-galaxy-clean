
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useTenantId } from '@/hooks/useTenantId';
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
  hasRole: (requiredRoles: UserRole[] | UserRole) => boolean;
} {
  const { user } = useAuth();
  const currentTenantId = useTenantId();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Use provided tenantId or fall back to current tenant
  const effectiveTenantId = tenantId || currentTenantId;

  useEffect(() => {
    const fetchRole = async () => {
      if (!user || !effectiveTenantId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('tenant_user_roles')
          .select('role')
          .eq('tenant_id', effectiveTenantId)
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
  }, [user, effectiveTenantId]);

  /**
   * Check if the user has any of the required roles
   * @param requiredRoles Single role or array of roles to check against
   * @returns boolean indicating if user has the required role
   */
  const hasRole = (requiredRoles: UserRole[] | UserRole): boolean => {
    if (!role) return false;
    
    // Admin and owner have access to everything
    if (role === 'admin' || role === 'owner') return true;
    
    // Check against single role or array of roles
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.includes(role);
  };

  return { role, loading, error, hasRole };
}

export default useTenantRole;
