
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { sortTenantsByRole, getUserTenants } from './workspaceUtils';
import { TenantWithRole } from '@/types/tenant';

export interface WorkspaceState {
  loading: boolean;
  tenants: TenantWithRole[];
  currentTenant: TenantWithRole | null;
  setCurrentTenant: (tenant: TenantWithRole) => void;
  refreshTenants: () => Promise<void>;
  error: string | null;
}

export function useWorkspaceState(): WorkspaceState {
  const [loading, setLoading] = useState<boolean>(true);
  const [tenants, setTenants] = useState<TenantWithRole[]>([]);
  const [currentTenant, setCurrentTenant] = useState<TenantWithRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      
      // Get the current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('No authenticated user found');
        setLoading(false);
        return;
      }
      
      // Fetch tenants for this user with their roles
      const { data, error: fetchError } = await supabase
        .from('tenant_user_roles')
        .select(`
          tenants:tenant_id(id, name, created_at),
          role
        `)
        .eq('user_id', user.id);
      
      if (fetchError) {
        throw fetchError;
      }
      
      // Transform the data into the required format
      const formattedTenants: TenantWithRole[] = data?.map(item => ({
        id: item.tenants.id,
        name: item.tenants.name,
        created_at: item.tenants.created_at,
        role: item.role
      })) || [];
      
      // Sort tenants by role
      const sortedTenants = sortTenantsByRole(formattedTenants);
      
      setTenants(sortedTenants);
      
      // Set the current tenant to the first one if not already set
      if (!currentTenant && sortedTenants.length > 0) {
        setCurrentTenant(sortedTenants[0]);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching tenants:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
    
    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchTenants();
      } else if (event === 'SIGNED_OUT') {
        setTenants([]);
        setCurrentTenant(null);
      }
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return {
    loading,
    tenants,
    currentTenant,
    setCurrentTenant: (tenant: TenantWithRole) => setCurrentTenant(tenant),
    refreshTenants: fetchTenants,
    error
  };
}
