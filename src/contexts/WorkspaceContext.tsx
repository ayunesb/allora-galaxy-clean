
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Tenant {
  id: string;
  name: string;
  created_at: string;
  metadata?: Record<string, any>;
}

interface User {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
}

interface WorkspaceContextType {
  tenant: Tenant | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setTenant: (tenant: Tenant | null) => void;
  refreshTenant: () => Promise<void>;
  switchTenant: (tenantId: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial tenant and user data
  useEffect(() => {
    const loadWorkspaceData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get current user
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          setIsLoading(false);
          return;
        }

        // Get user's tenants and roles
        const { data: userTenants, error: tenantsError } = await supabase
          .from('tenant_user_roles')
          .select('tenant_id, role, tenants:tenant_id(id, name, created_at, metadata)')
          .eq('user_id', authUser.id);

        if (tenantsError) {
          throw new Error(`Failed to load tenants: ${tenantsError.message}`);
        }

        if (userTenants && userTenants.length > 0) {
          // Set the first tenant as active
          const firstTenant = userTenants[0].tenants as unknown as Tenant;
          setTenant(firstTenant);
          
          // Set user with role
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            role: userTenants[0].role as 'owner' | 'admin' | 'member' | 'viewer'
          });
        }

      } catch (err: any) {
        console.error('Error loading workspace data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkspaceData();
  }, []);

  const refreshTenant = async () => {
    if (!tenant) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenant.id)
        .single();

      if (error) throw error;
      if (data) setTenant(data);
    } catch (err: any) {
      console.error('Error refreshing tenant:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const switchTenant = async (tenantId: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (error) throw error;
      
      if (data) {
        setTenant(data);
        
        // Update user role for this tenant
        const { data: userData, error: userError } = await supabase
          .from('tenant_user_roles')
          .select('role')
          .eq('tenant_id', tenantId)
          .single();
          
        if (userError) throw userError;
        
        if (userData && user) {
          setUser({
            ...user,
            role: userData.role as 'owner' | 'admin' | 'member' | 'viewer'
          });
        }
      }
    } catch (err: any) {
      console.error('Error switching tenant:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    tenant,
    user,
    isLoading,
    error,
    setTenant,
    refreshTenant,
    switchTenant
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

export default WorkspaceContext;
