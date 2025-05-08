
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface Tenant {
  id: string;
  name: string;
  created_at: string;
  settings?: Record<string, any>;
}

interface WorkspaceContextType {
  tenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
  refreshTenant: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

interface WorkspaceProviderProps {
  children: ReactNode;
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTenant = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // First get the tenant_id from tenant_user_roles
      const { data: userTenant, error: userTenantError } = await supabase
        .from('tenant_user_roles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (userTenantError) throw userTenantError;

      // If tenant_id is found, get the tenant details
      if (userTenant?.tenant_id) {
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', userTenant.tenant_id)
          .maybeSingle();

        if (tenantError) throw tenantError;

        if (tenantData) {
          setTenant(tenantData);
        } else {
          setTenant(null);
        }
      } else {
        setTenant(null);
      }
    } catch (err: any) {
      console.error('Error fetching workspace tenant:', err);
      setError(err.message || 'Failed to load workspace');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenant();
  }, [user]);

  const refreshTenant = async () => {
    await fetchTenant();
  };

  return (
    <WorkspaceContext.Provider value={{ tenant, isLoading, error, refreshTenant }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  
  return context;
};

export default WorkspaceContext;
