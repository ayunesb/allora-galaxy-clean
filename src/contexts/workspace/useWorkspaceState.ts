
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TenantWithRole } from './types';
import { UserRole } from '@/types/shared';

export function useWorkspaceState() {
  const [currentTenant, setCurrentTenant] = useState<TenantWithRole | null>(null);
  const [tenants, setTenants] = useState<TenantWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | undefined>(undefined);
  
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setIsLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsLoading(false);
          return;
        }
        
        // Fetch tenants the user has access to
        const { data: userTenants, error } = await supabase
          .from('tenant_user_roles')
          .select(`
            tenants:tenant_id (id, name, slug),
            role
          `)
          .eq('user_id', session.user.id);
          
        if (error) {
          console.error('Error fetching tenants:', error);
          setIsLoading(false);
          return;
        }
        
        // Transform the data
        const formattedTenants: TenantWithRole[] = userTenants.map((item: any) => ({
          id: item.tenants.id,
          name: item.tenants.name,
          slug: item.tenants.slug,
          role: item.role as UserRole
        }));
        
        setTenants(formattedTenants);
        
        // Set first tenant as current if none is selected
        if (formattedTenants.length > 0 && !currentTenant) {
          const firstTenant = formattedTenants[0];
          setCurrentTenant(firstTenant);
          setUserRole(firstTenant.role);
        }
      } catch (error) {
        console.error('Error in fetchTenants:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTenants();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchTenants();
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [currentTenant]);
  
  // Update userRole when currentTenant changes
  useEffect(() => {
    if (currentTenant) {
      setUserRole(currentTenant.role);
    } else {
      setUserRole(undefined);
    }
  }, [currentTenant]);
  
  const handleSetCurrentTenant = (tenant: TenantWithRole | null) => {
    setCurrentTenant(tenant);
    if (tenant) {
      setUserRole(tenant.role);
    } else {
      setUserRole(undefined);
    }
  };
  
  return {
    currentTenant,
    tenants,
    setCurrentTenant: handleSetCurrentTenant,
    isLoading,
    userRole
  };
}
