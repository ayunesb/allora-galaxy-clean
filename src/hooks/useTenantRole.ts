
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import useAuth from './useAuth';
import { UserRole } from '@/types/shared';

export interface UseTenantRoleResult {
  role: UserRole | null;
  isAdmin: boolean;
  isOwner: boolean;
  isUser: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTenantRole(tenantId?: string): UseTenantRoleResult {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRole = useCallback(async () => {
    if (!user || !tenantId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('tenant_user_roles')
        .select('role')
        .eq('tenant_id', tenantId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setRole(data?.role as UserRole);
    } catch (err: any) {
      console.error('Error fetching user role:', err);
      setError(err);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, [user, tenantId]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  return {
    role,
    isAdmin: role === 'admin' || role === 'owner',
    isOwner: role === 'owner',
    isUser: !!role,
    isLoading,
    error,
    refetch: fetchRole
  };
}

export default useTenantRole;
