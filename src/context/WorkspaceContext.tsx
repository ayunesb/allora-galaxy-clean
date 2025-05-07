
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

type Tenant = {
  id: string;
  name: string;
  slug: string;
  metadata?: any;
};

type WorkspaceContextType = {
  tenants: Tenant[];
  currentTenant: Tenant | null;
  setCurrentTenant: (tenant: Tenant) => void;
  loading: boolean;
  error: string | null;
  createTenant: (name: string) => Promise<{ data: Tenant | null; error: any }>;
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's tenants when auth state changes
  useEffect(() => {
    if (!user) {
      setTenants([]);
      setCurrentTenant(null);
      setLoading(false);
      return;
    }

    async function fetchTenants() {
      setLoading(true);
      try {
        // Get tenants where user has a role
        const { data, error } = await supabase
          .from('tenant_user_roles')
          .select('tenant:tenants(*)')
          .eq('user_id', user.id);

        if (error) throw error;

        // Extract tenant data and remove duplicates
        const fetchedTenants = data
          .map((item: any) => item.tenant as Tenant)
          .filter((tenant: Tenant | null): tenant is Tenant => tenant !== null);

        setTenants(fetchedTenants);

        // If we have tenants but no current tenant set, set the first one
        if (fetchedTenants.length > 0 && !currentTenant) {
          // Try to get the last used tenant from local storage
          const lastTenantId = localStorage.getItem('lastTenantId');
          const lastTenant = lastTenantId 
            ? fetchedTenants.find(t => t.id === lastTenantId)
            : null;
          
          setCurrentTenant(lastTenant || fetchedTenants[0]);
        }
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching tenants:', err);
        setError(err.message || 'Failed to fetch workspaces');
        toast({
          title: 'Error fetching workspaces',
          description: err.message || 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchTenants();
  }, [user]);

  // Save selected tenant to local storage when it changes
  useEffect(() => {
    if (currentTenant) {
      localStorage.setItem('lastTenantId', currentTenant.id);
    }
  }, [currentTenant]);

  const createTenant = async (name: string) => {
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    try {
      // Generate a URL-friendly slug from the name
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Create a new tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({ name, slug, owner_id: user.id })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Create owner role for the current user
      const { error: roleError } = await supabase
        .from('tenant_user_roles')
        .insert({
          tenant_id: tenant.id,
          user_id: user.id,
          role: 'owner',
        });

      if (roleError) throw roleError;

      // Update local state
      setTenants([...tenants, tenant]);
      setCurrentTenant(tenant);

      toast({
        title: 'Workspace created',
        description: `${name} has been created successfully`,
      });

      return { data: tenant, error: null };
    } catch (err: any) {
      console.error('Error creating tenant:', err);
      toast({
        title: 'Failed to create workspace',
        description: err.message || 'Please try again',
        variant: 'destructive',
      });
      return { data: null, error: err };
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        tenants,
        currentTenant,
        setCurrentTenant,
        loading,
        error,
        createTenant,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
