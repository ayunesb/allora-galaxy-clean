
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { sortTenantsByRole } from './workspaceUtils';
import { TenantWithRole, WorkspaceContextType } from './types';

export function useWorkspaceState(): WorkspaceContextType {
  const [tenants, setTenants] = useState<TenantWithRole[]>([]);
  const [currentTenant, setCurrentTenant] = useState<TenantWithRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserTenants = async () => {
      setIsLoading(true);
      try {
        // Get the current authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error("Error loading user:", userError);
          setIsLoading(false);
          return;
        }

        // Get tenants the user has access to with their role
        const { data: tenantsData, error: tenantsError } = await supabase
          .from('tenant_user_roles')
          .select(`
            tenant_id,
            role,
            tenants:tenant_id (
              id,
              name,
              slug,
              created_at,
              updated_at,
              metadata
            )
          `)
          .eq('user_id', user.id);
        
        if (tenantsError) {
          console.error("Error loading tenants:", tenantsError);
          setIsLoading(false);
          return;
        }

        // Transform the data to the format we need
        const userTenants: TenantWithRole[] = (tenantsData || []).map((item: any) => ({
          ...item.tenants,
          role: item.role,
        }));

        // Sort tenants by role (owners first, then admins, etc.)
        const sortedTenants = sortTenantsByRole(userTenants);
        
        setTenants(sortedTenants);
        
        // Set the current tenant to the first one if there's no current tenant yet
        if (sortedTenants.length > 0 && !currentTenant) {
          setCurrentTenant(sortedTenants[0]);
        }
      } catch (error) {
        console.error("Unexpected error loading workspace data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserTenants();
  }, []);

  return {
    currentTenant,
    tenants,
    setCurrentTenant,
    isLoading
  };
}
